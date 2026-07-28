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
  
  // Devices state
  const [audioInputDevices, setAudioInputDevices] = useState([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState([]);
  const [videoInputDevices, setVideoInputDevices] = useState([]);

  const [selectedAudioInput, setSelectedAudioInput] = useState(() => localStorage.getItem('panda_audio_input') || 'default');
  const [selectedAudioOutput, setSelectedAudioOutput] = useState(() => localStorage.getItem('panda_audio_output') || 'default');
  const [selectedVideoInput, setSelectedVideoInput] = useState(() => localStorage.getItem('panda_video_input') || 'default');

  // WebRTC Audio Constraints
  const [noiseSuppression, setNoiseSuppression] = useState(() => localStorage.getItem('panda_noise_suppression') !== 'false');
  const [echoCancellation, setEchoCancellation] = useState(() => localStorage.getItem('panda_echo_cancellation') !== 'false');
  const [autoGainControl, setAutoGainControl] = useState(() => localStorage.getItem('panda_auto_gain') !== 'false');

  // Peer Connections map: socketId -> { pc, stream, user, isMuted, isDeafened, isCamOn, isScreenSharing }
  const [peersMap, setPeersMap] = useState({});
  const peersRef = useRef({});
  const localStreamRef = useRef(null);

  // Active channel voice member counters: channelId -> Array of members
  const [channelVoiceMembers, setChannelVoiceMembers] = useState({});

  // Enumerate hardware devices
  const refreshDevices = async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      setAudioInputDevices(devices.filter(d => d.kind === 'audioinput'));
      setAudioOutputDevices(devices.filter(d => d.kind === 'audiooutput'));
      setVideoInputDevices(devices.filter(d => d.kind === 'videoinput'));
    } catch (err) {
      console.error('Error enumerating audio/video devices:', err);
    }
  };

  useEffect(() => {
    refreshDevices();
    if (navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', refreshDevices);
      return () => navigator.mediaDevices.removeEventListener('devicechange', refreshDevices);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('panda_audio_input', selectedAudioInput);
  }, [selectedAudioInput]);

  useEffect(() => {
    localStorage.setItem('panda_audio_output', selectedAudioOutput);
  }, [selectedAudioOutput]);

  useEffect(() => {
    localStorage.setItem('panda_video_input', selectedVideoInput);
  }, [selectedVideoInput]);

  useEffect(() => {
    localStorage.setItem('panda_noise_suppression', noiseSuppression);
  }, [noiseSuppression]);

  useEffect(() => {
    localStorage.setItem('panda_echo_cancellation', echoCancellation);
  }, [echoCancellation]);

  useEffect(() => {
    localStorage.setItem('panda_auto_gain', autoGainControl);
  }, [autoGainControl]);

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
      for (const peerInfo of peers) {
        await createPeerConnection(peerInfo.socketId, peerInfo.user, true);
      }
    });

    socket.on('voice-peer-joined', async (member) => {
      await createPeerConnection(member.socketId, member.user, false);
    });

    socket.on('voice-peer-left', ({ socketId }) => {
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

    socket.on('voice-peer-state-changed', ({ socketId, isMuted, isDeafened, isCamOn, isScreenSharing, isSpeaking }) => {
      setPeersMap(prev => {
        if (!prev[socketId]) return prev;
        return {
          ...prev,
          [socketId]: {
            ...prev[socketId],
            isMuted,
            isDeafened,
            isCamOn,
            isScreenSharing,
            isSpeaking
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
        const audioConstraints = {
          deviceId: selectedAudioInput !== 'default' ? { exact: selectedAudioInput } : undefined,
          noiseSuppression,
          echoCancellation,
          autoGainControl
        };

        const videoConstraints = video ? {
          deviceId: selectedVideoInput !== 'default' ? { exact: selectedVideoInput } : undefined,
          width: 1280,
          height: 720
        } : false;

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints,
          video: videoConstraints
        });
        localStreamRef.current = stream;
      }
      return localStreamRef.current;
    } catch (err) {
      console.warn('Microphone/Camera access fallback:', err.message);
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
    soundFx.playJoinVoiceSound();

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
    soundFx.playMuteSound();

    if (socket) {
      socket.emit('voice-leave');
    }

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
    if (nextMuted) soundFx.playMuteSound();
    else soundFx.playJoinVoiceSound();

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
    if (nextDeaf) soundFx.playMuteSound();
    else soundFx.playJoinVoiceSound();

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
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: selectedVideoInput !== 'default' ? { deviceId: { exact: selectedVideoInput } } : true
        });
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

  const startScreenShareWithSourceId = async (sourceId) => {
    try {
      let screenStream;
      if (sourceId) {
        screenStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sourceId,
              minWidth: 1280,
              maxWidth: 1920,
              minHeight: 720,
              maxHeight: 1080
            }
          }
        });
      } else {
        screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      }

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

      if (socket && activeVoiceChannelId) {
        socket.emit('voice-state-update', {
          voiceChannelId: activeVoiceChannelId,
          isScreenSharing: true
        });
      }
    } catch (err) {
      console.error('Screen sharing start error:', err);
      setIsScreenSharing(false);
    }
  };

  const stopScreenShare = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => {
        if (t.label?.toLowerCase().includes('screen') || t.label?.toLowerCase().includes('display')) {
          t.stop();
        }
      });
    }
    setIsScreenSharing(false);
    if (socket && activeVoiceChannelId) {
      socket.emit('voice-state-update', {
        voiceChannelId: activeVoiceChannelId,
        isScreenSharing: false
      });
    }
  };

  return (
    <VoiceContext.Provider value={{
      activeVoiceChannelId,
      activeVoiceChannelName,
      joinVoiceChannel,
      leaveVoiceChannel,
      isMuted,
      setIsMuted,
      toggleMute,
      isDeafened,
      toggleDeafen,
      isCamOn,
      toggleCamera,
      isScreenSharing,
      startScreenShareWithSourceId,
      stopScreenShare,
      peersMap,
      channelVoiceMembers,
      localStream: localStreamRef.current,
      // Hardware device controls
      audioInputDevices,
      audioOutputDevices,
      videoInputDevices,
      selectedAudioInput,
      setSelectedAudioInput,
      selectedAudioOutput,
      setSelectedAudioOutput,
      selectedVideoInput,
      setSelectedVideoInput,
      noiseSuppression,
      setNoiseSuppression,
      echoCancellation,
      setEchoCancellation,
      autoGainControl,
      setAutoGainControl,
      refreshDevices
    }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => useContext(VoiceContext);
