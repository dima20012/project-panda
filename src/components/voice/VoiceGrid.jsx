import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, PhoneOff, Headphones } from 'lucide-react';
import { useVoice } from '../../context/VoiceContext';
import { useAuth } from '../../context/AuthContext';
import { ScreenShareModal } from '../modals/ScreenShareModal';

const VideoElement = ({ stream, isLocal = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isLocal}
      className="video-stream-element"
    />
  );
};

export const VoiceGrid = () => {
  const { 
    activeVoiceChannelName, leaveVoiceChannel, isMuted, toggleMute, 
    isDeafened, toggleDeafen, isCamOn, toggleCamera, isScreenSharing, 
    startScreenShareWithSourceId, stopScreenShare,
    peersMap, localStream
  } = useVoice();
  const { currentUser } = useAuth();

  const [showScreenShareModal, setShowScreenShareModal] = useState(false);

  const peersList = Object.values(peersMap);

  const handleScreenShareClick = () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      setShowScreenShareModal(true);
    }
  };

  return (
    <div className="voice-grid-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-header)' }}>
          🔊 {activeVoiceChannelName} — Real-time Voice & Video
        </h2>
      </div>

      {/* Grid of participants */}
      <div className="voice-video-grid">
        {/* Local User Card */}
        {currentUser && (
          <div className={`video-card ${!isMuted ? 'speaking' : ''}`}>
            {isCamOn || isScreenSharing ? (
              <VideoElement stream={localStream} isLocal={true} />
            ) : (
              <div className="video-avatar-fallback">
                <img src={currentUser.avatar} alt={currentUser.displayName} />
                <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-header)' }}>
                  {currentUser.displayName} (You)
                </span>
              </div>
            )}

            <div className="video-card-overlay">
              <span>{currentUser.displayName}</span>
              {isMuted ? <MicOff size={14} style={{ color: '#f23f43' }} /> : <Mic size={14} style={{ color: '#57F287' }} />}
              {isCamOn && <Video size={14} style={{ color: '#57F287' }} />}
              {isScreenSharing && <Monitor size={14} style={{ color: '#57F287' }} />}
            </div>
          </div>
        )}

        {/* Remote Peers Cards */}
        {peersList.map((peer) => (
          <div key={peer.socketId} className={`video-card ${peer.isSpeaking || !peer.isMuted ? 'speaking' : ''}`}>
            {peer.isCamOn || peer.isScreenSharing ? (
              <VideoElement stream={peer.stream} isLocal={false} />
            ) : (
              <div className="video-avatar-fallback">
                <img src={peer.user.avatar} alt={peer.user.displayName} />
                <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-header)' }}>
                  {peer.user.displayName}
                </span>
              </div>
            )}

            <div className="video-card-overlay">
              <span>{peer.user.displayName}</span>
              {peer.isMuted ? <MicOff size={14} style={{ color: '#f23f43' }} /> : <Mic size={14} style={{ color: '#57F287' }} />}
              {peer.isCamOn && <Video size={14} style={{ color: '#57F287' }} />}
            </div>
          </div>
        ))}
      </div>

      {/* Voice Controls Bar */}
      <div style={{
        background: 'var(--bg-sidebar)',
        borderRadius: '12px',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        boxShadow: 'var(--shadow-main)',
        flexShrink: 0
      }}>
        <button 
          className={`btn ${isMuted ? 'btn-danger' : 'btn-secondary'}`}
          onClick={toggleMute}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
          <span>{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>

        <button 
          className={`btn ${isDeafened ? 'btn-danger' : 'btn-secondary'}`}
          onClick={toggleDeafen}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Headphones size={18} />
          <span>{isDeafened ? 'Undeafen' : 'Deafen'}</span>
        </button>

        <button 
          className={`btn ${isCamOn ? 'btn-primary' : 'btn-secondary'}`}
          onClick={toggleCamera}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {isCamOn ? <Video size={18} /> : <VideoOff size={18} />}
          <span>{isCamOn ? 'Camera On' : 'Turn On Camera'}</span>
        </button>

        <button 
          className={`btn ${isScreenSharing ? 'btn-primary' : 'btn-secondary'}`}
          onClick={handleScreenShareClick}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Monitor size={18} />
          <span>{isScreenSharing ? 'Stop Share' : 'Share Screen'}</span>
        </button>

        <button 
          className="btn btn-danger"
          onClick={leaveVoiceChannel}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <PhoneOff size={18} />
          <span>Disconnect</span>
        </button>
      </div>

      {showScreenShareModal && (
        <ScreenShareModal 
          onClose={() => setShowScreenShareModal(false)}
          onSelectSource={(sourceId) => startScreenShareWithSourceId(sourceId)}
        />
      )}
    </div>
  );
};
