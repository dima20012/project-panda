import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { soundFx } from '../utils/soundEffects';

const VoiceContext = createContext();

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export const VoiceProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { socket } = useSocket();

  const [activeVoiceChannelId, setActiveVoiceChannelId] = useState(null);
  const [activeVoiceChannelName, setActiveVoiceChannelName] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Peer Connections map: socketId -> { peerConnection, stream, user, isMuted, isDeafened, isCamOn, isScreenSharing }
  const [peersMap, setPeersMap] = useState({});
  const peersRef = useRef({});
  const localStreamRef = useRef(null);

  // Active channel voice member counters: channelId -> Array of members
  const [channelVoiceMembers, setChannelVoiceMembers] = useState({});

  // Socket WebRTC signaling listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('voice-channel-update', ({ channelId, members }) => {
      setChannelVoiceMembers(prev => ({
        ...prev,
        [channelId]: members
      }));
    });

    socket.on('voice-room-users', async ({ channelId, peers }) => {
      console.log('Joined voice channel, existing peers:', peers);
      for (const peerInfo of peers) {
        await createPeerConnection(peerInfo.socketId, peerInfo.user, true);
      }
    });

    socket.on('voice-peer-joined', async (member) => {
      console.log('Voice peer joined:', member);
      await createPeerConnection(member.socketId, member.user, false);
    });

    socket.on('voice-peer-left', ({ socketId }) => {
      console.log('Voice peer left:', socketId);
      removePeerConnection(socketId);
    });

    socket.on('webrtc-offer', async ({ senderSocketId, offer }) => {
      const pc = peersRef.current[senderSocketId]?.pc;
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc-answer', { targetSocketId: senderSocketId, answer });
      }
    });

    socket.on('webrtc-answer', async ({ senderSocketId, answer }) => {
      const pc = peersRef.current[senderSocketId]?.pc;
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on('webrtc-candidate', async ({ senderSocketId, candidate }) => {
      const pc = peersRef.current[senderSocketId]?.pc;
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding ICE candidate:', e);
        }
      }
    });

    socket.on('voice-peer-state-changed', ({ socketId, isMuted, isDeafened, isCamOn, isScreenSharing }) => {
      setPeersMap(prev => {
        if (!prev[socketId]) return prev;
        return {
          ...prev,
          [socketId]: {
            ...prev[socketId],
            isMuted,
            isDeafened,
            isCamOn,
            isScreenSharing
          }
        };
      });
    });

    return () => {
      socket.off('voice-channel-update');
      socket.off('voice-room-users');
      socket.off('voice-peer-joined');
      socket.off('voice-peer-left');
      socket.off('webrtc-offer');
      socket.off('webrtc-answer');
      socket.off('webrtc-candidate');
      socket.off('voice-peer-state-changed');
    };
  }, [socket]);

  const getOrCreateLocalStream = async (video = false) => {
    try {
      if (!localStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: video ? { width: 1280, height: 720 } : false
        });
        localStreamRef.current = stream;
      }
      return localStreamRef.current;
    } catch (err) {
      console.warn('Microphone/Camera access not granted or unavailable:', err.message);
      // Create empty synthetic audio stream for fallback
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const dst = ctx.createMediaStreamDestination();
      osc.connect(dst);
      osc.start();
      localStreamRef.current = dst.stream;
      return localStreamRef.current;
    }
  };

  const createPeerConnection = async (targetSocketId, user, isInitiator) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    const localStream = await getOrCreateLocalStream();

    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc-candidate', { targetSocketId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      setPeersMap(prev => ({
        ...prev,
        [targetSocketId]: {
          ...prev[targetSocketId],
          stream: remoteStream
        }
      }));
    };

    peersRef.current[targetSocketId] = { pc, user };

    setPeersMap(prev => ({
      ...prev,
      [targetSocketId]: {
        socketId: targetSocketId,
        user,
        stream: null,
        isMuted: false,
        isDeafened: false,
        isCamOn: false,
        isScreenSharing: false
      }
    }));

    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('webrtc-offer', { targetSocketId, offer });
    }
  };

  const removePeerConnection = (targetSocketId) => {
    if (peersRef.current[targetSocketId]) {
      peersRef.current[targetSocketId].pc.close();
      delete peersRef.current[targetSocketId];
    }
    setPeersMap(prev => {
      const next = { ...prev };
      delete next[targetSocketId];
      return next;
    });
  };

  const joinVoiceChannel = async (channelId, channelName) => {
    if (activeVoiceChannelId === channelId) return;

    if (activeVoiceChannelId) {
      leaveVoiceChannel();
    }

    setActiveVoiceChannelId(channelId);
    setActiveVoiceChannelName(channelName);
    soundFx.playJoinVoice();

    await getOrCreateLocalStream();

    if (socket && currentUser) {
      socket.emit('voice-join', {
        voiceChannelId: channelId,
        user: currentUser,
        isMuted,
        isDeafened,
        isCamOn,
        isScreenSharing
      });
    }
  };

  const leaveVoiceChannel = () => {
    if (!activeVoiceChannelId) return;

    soundFx.playLeaveVoice();

    if (socket) {
      socket.emit('voice-leave');
    }

    // Close all peer connections
    Object.keys(peersRef.current).forEach(targetSocketId => {
      peersRef.current[targetSocketId].pc.close();
    });
    peersRef.current = {};
    setPeersMap({});

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }

    setActiveVoiceChannelId(null);
    setActiveVoiceChannelName('');
    setIsCamOn(false);
    setIsScreenSharing(false);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) soundFx.playMute();
    else soundFx.playUnmute();

    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !nextMuted; });
    }

    if (socket && activeVoiceChannelId) {
      socket.emit('voice-state-update', {
        voiceChannelId: activeVoiceChannelId,
        isMuted: nextMuted
      });
    }
  };

  const toggleDeafen = () => {
    const nextDeaf = !isDeafened;
    setIsDeafened(nextDeaf);
    if (nextDeaf) soundFx.playMute();
    else soundFx.playUnmute();

    if (socket && activeVoiceChannelId) {
      socket.emit('voice-state-update', {
        voiceChannelId: activeVoiceChannelId,
        isDeafened: nextDeaf
      });
    }
  };

  const toggleCamera = async () => {
    try {
      const nextCam = !isCamOn;
      setIsCamOn(nextCam);

      if (nextCam) {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTrack = videoStream.getVideoTracks()[0];
        if (localStreamRef.current) {
          localStreamRef.current.addTrack(videoTrack);
        }
      } else {
        if (localStreamRef.current) {
          localStreamRef.current.getVideoTracks().forEach(t => t.stop());
        }
      }

      if (socket && activeVoiceChannelId) {
        socket.emit('voice-state-update', {
          voiceChannelId: activeVoiceChannelId,
          isCamOn: nextCam
        });
      }
    } catch (err) {
      console.error('Camera toggle error:', err);
      setIsCamOn(false);
    }
  };

  const toggleScreenShare = async () => {
    try {
      const nextShare = !isScreenSharing;
      if (nextShare) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        screenTrack.onended = () => {
          setIsScreenSharing(false);
          if (socket && activeVoiceChannelId) {
            socket.emit('voice-state-update', { voiceChannelId: activeVoiceChannelId, isScreenSharing: false });
          }
        };

        if (localStreamRef.current) {
          localStreamRef.current.addTrack(screenTrack);
        }
        setIsScreenSharing(true);
      } else {
        setIsScreenSharing(false);
      }

      if (socket && activeVoiceChannelId) {
        socket.emit('voice-state-update', {
          voiceChannelId: activeVoiceChannelId,
          isScreenSharing: !isScreenSharing
        });
      }
    } catch (err) {
      console.error('Screen sharing error:', err);
      setIsScreenSharing(false);
    }
  };

  return (
    <VoiceContext.Provider value={{
      activeVoiceChannelId,
      activeVoiceChannelName,
      joinVoiceChannel,
      leaveVoiceChannel,
      isMuted,
      toggleMute,
      isDeafened,
      toggleDeafen,
      isCamOn,
      toggleCamera,
      isScreenSharing,
      toggleScreenShare,
      peersMap,
      channelVoiceMembers,
      localStream: localStreamRef.current
    }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => useContext(VoiceContext);
