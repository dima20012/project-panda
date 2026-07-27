import React, { useState } from 'react';
import { Search, Hash, Volume2, User, MessageSquare, X } from 'lucide-react';
import { useServer } from '../../context/ServerContext';
import { useAuth } from '../../context/AuthContext';

export const SearchModal = ({ onClose }) => {
  const { servers, setActiveServerId, setActiveChannelId, setActiveDMUser, messages } = useServer();
  const { allUsers } = useAuth();
  const [query, setQuery] = useState('');

  if (!query.trim()) {
    // Show empty state / suggestions
  }

  // Filter channels
  const allChannels = servers.flatMap(s => (s.categories || []).flatMap(c => (c.channels || []).map(ch => ({ ...ch, serverName: s.name, serverId: s.id }))));
  const matchedChannels = allChannels.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  // Filter users
  const matchedUsers = allUsers.filter(u => u.displayName?.toLowerCase().includes(query.toLowerCase()) || u.username.toLowerCase().includes(query.toLowerCase()));

  // Filter messages
  const matchedMessages = messages.filter(m => m.content?.toLowerCase().includes(query.toLowerCase()));

  const handleSelectChannel = (channel) => {
    setActiveServerId(channel.serverId);
    setActiveChannelId(channel.id);
    onClose();
  };

  const handleSelectUser = (user) => {
    setActiveServerId('home');
    setActiveDMUser(user);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2500 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '600px' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Search size={20} style={{ color: 'var(--neon-cyan)' }} />
          <input 
            className="chat-input"
            placeholder="Search channels, friends, and messages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ padding: '16px', maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!query.trim() ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '24px' }}>
              Type a channel name, user, or keyword to search across Project Panda.
            </div>
          ) : (
            <>
              {/* Channels Matches */}
              {matchedChannels.length > 0 && (
                <div>
                  <div className="form-label" style={{ marginBottom: '8px' }}>Channels</div>
                  {matchedChannels.map(c => (
                    <div 
                      key={c.id} 
                      className="channel-item"
                      onClick={() => handleSelectChannel(c)}
                      style={{ padding: '8px 12px' }}
                    >
                      {c.type === 'text' ? <Hash size={16} /> : <Volume2 size={16} />}
                      <span style={{ fontWeight: '600' }}>{c.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{c.serverName}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Users Matches */}
              {matchedUsers.length > 0 && (
                <div>
                  <div className="form-label" style={{ marginBottom: '8px' }}>Friends & Users</div>
                  {matchedUsers.map(u => (
                    <div 
                      key={u.id} 
                      className="member-card"
                      onClick={() => handleSelectUser(u)}
                      style={{ padding: '8px 12px' }}
                    >
                      <img src={u.avatar} alt={u.displayName} style={{ width: '28px', height: '28px', borderRadius: '8px' }} />
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>{u.displayName}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{u.username}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Messages Matches */}
              {matchedMessages.length > 0 && (
                <div>
                  <div className="form-label" style={{ marginBottom: '8px' }}>Messages</div>
                  {matchedMessages.slice(0, 5).map(m => (
                    <div 
                      key={m.id} 
                      style={{
                        padding: '10px 12px',
                        background: 'var(--bg-card)',
                        borderRadius: '8px',
                        fontSize: '13px',
                        marginBottom: '6px',
                        border: '1px solid var(--glass-border)'
                      }}
                    >
                      <div style={{ fontSize: '11px', color: 'var(--neon-cyan)', marginBottom: '2px' }}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div>{m.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
