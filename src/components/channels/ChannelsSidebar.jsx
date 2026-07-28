import React, { useState, useEffect } from 'react';
import { 
  Hash, Volume2, Plus, Mic, MicOff, Headphones, Settings, 
  PhoneOff, Video, Monitor, ChevronDown, UserPlus, Globe 
} from 'lucide-react';
import { useServer } from '../../context/ServerContext';
import { useVoice } from '../../context/VoiceContext';
import { useAuth } from '../../context/AuthContext';
import { getServerUrl, pingServerNode } from '../../utils/apiConfig';

export const ChannelsSidebar = ({ onOpenCreateChannel, onOpenSettings, onOpenInvite }) => {
  const { activeServer, activeChannelId, setActiveChannelId, activeServerId } = useServer();
  const { 
    activeVoiceChannelId, activeVoiceChannelName, joinVoiceChannel, leaveVoiceChannel,
    isMuted, toggleMute, isDeafened, toggleDeafen, isCamOn, toggleCamera, isScreenSharing, toggleScreenShare,
    channelVoiceMembers
  } = useVoice();
  const { currentUser } = useAuth();

  const [nodePing, setNodePing] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const checkPing = async () => {
      const res = await pingServerNode();
      if (isMounted) setNodePing(res);
    };
    checkPing();
    const interval = setInterval(checkPing, 15000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  const [expandedCategories, setExpandedCategories] = useState({
    cat_welcome: true,
    cat_text: true,
    cat_voice: true
  });

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  if (activeServerId === 'home') {
    return (
      <div className="channels-sidebar">
        <div className="server-header">
          <span>Direct Messages</span>
        </div>
        <div style={{ padding: '16px 8px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Select a friend from the list to start chatting or video calling.
        </div>
      </div>
    );
  }

  if (!activeServer) return null;

  return (
    <div className="channels-sidebar">
      {/* Server Header */}
      <div className="server-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px', padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '800', fontSize: '15px' }}>
            {activeServer.name}
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              className="icon-btn" 
              title="Invite Friends"
              onClick={onOpenInvite}
              style={{ width: '28px', height: '28px' }}
            >
              <UserPlus size={16} />
            </button>
          </div>
        </div>

        {/* Server Node Live Ping Badge */}
        {nodePing && nodePing.success && (
          <div style={{ fontSize: '10px', color: 'var(--neon-emerald)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--neon-emerald)', boxShadow: '0 0 8px var(--neon-emerald-glow)' }}></span>
            {nodePing.data.serverName} • {nodePing.latency}ms
          </div>
        )}
      </div>

      {/* Channel Categories & Channels */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {activeServer.categories?.map((cat) => {
          const isExpanded = expandedCategories[cat.id] !== false;
          return (
            <div key={cat.id} style={{ marginBottom: '12px' }}>
              <div className="channel-category">
                <div 
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                  onClick={() => toggleCategory(cat.id)}
                >
                  <ChevronDown 
                    size={14} 
                    style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s ease' }} 
                  />
                  <span>{cat.name}</span>
                </div>
                <Plus 
                  size={14} 
                  style={{ cursor: 'pointer' }} 
                  title="Create Channel"
                  onClick={() => onOpenCreateChannel(cat.id)}
                />
              </div>

              {isExpanded && cat.channels?.map((channel) => {
                const isText = channel.type === 'text';
                const isActive = activeChannelId === channel.id;
                const isVoiceActive = activeVoiceChannelId === channel.id;
                const membersInVoice = channelVoiceMembers[channel.id] || [];

                return (
                  <div key={channel.id}>
                    <div
                      className={`channel-item ${isActive ? 'active' : ''} ${isVoiceActive ? 'voice-active' : ''}`}
                      onClick={() => {
                        if (isText) {
                          setActiveChannelId(channel.id);
                        } else {
                          setActiveChannelId(channel.id);
                          joinVoiceChannel(channel.id, channel.name);
                        }
                      }}
                    >
                      {isText ? <Hash size={18} /> : <Volume2 size={18} />}
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {channel.name}
                      </span>

                      {!isText && membersInVoice.length > 0 && (
                        <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '10px' }}>
                          {membersInVoice.length}
                        </span>
                      )}
                    </div>

                    {/* Members connected to this voice channel */}
                    {!isText && membersInVoice.length > 0 && (
                      <div className="channel-voice-users">
                        {membersInVoice.map((m) => (
                          <div key={m.socketId} className="voice-user-row">
                            <img 
                              src={m.user.avatar} 
                              alt={m.user.displayName} 
                              style={{ width: '20px', height: '20px', borderRadius: '50%' }} 
                            />
                            <span>{m.user.displayName || m.user.username}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Active Voice Connection Header (If Connected to WebRTC Voice) */}
      {activeVoiceChannelId && (
        <div className="voice-connected-bar">
          <div>
            <div style={{ color: '#57F287', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Volume2 size={16} /> Voice Connected
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
              {activeVoiceChannelName} / RTC Local
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button className="icon-btn" title="Toggle Camera" onClick={toggleCamera}>
              <Video size={16} style={{ color: isCamOn ? '#57F287' : 'inherit' }} />
            </button>
            <button className="icon-btn" title="Share Screen" onClick={toggleScreenShare}>
              <Monitor size={16} style={{ color: isScreenSharing ? '#57F287' : 'inherit' }} />
            </button>
            <button className="icon-btn active-danger" title="Disconnect Voice" onClick={leaveVoiceChannel}>
              <PhoneOff size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Current User Control Bar */}
      {currentUser && (
        <div className="user-bar">
          <div className="user-info-btn" onClick={onOpenSettings} title="User Profile & Settings">
            <div className="avatar-wrapper">
              <img className="avatar-img" src={currentUser.avatar} alt={currentUser.displayName} />
              <div className={`status-indicator ${currentUser.status}`} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-header)', lineHeight: '1.2' }}>
                {currentUser.displayName || currentUser.username}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.customStatus || `#${currentUser.username}`}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2px' }}>
            <button className="icon-btn" onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted ? <MicOff size={18} style={{ color: '#f23f43' }} /> : <Mic size={18} />}
            </button>
            <button className="icon-btn" onClick={toggleDeafen} title={isDeafened ? 'Undeafen' : 'Deafen'}>
              <Headphones size={18} style={{ color: isDeafened ? '#f23f43' : 'inherit' }} />
            </button>
            <button className="icon-btn" onClick={onOpenSettings} title="User Settings">
              <Settings size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
