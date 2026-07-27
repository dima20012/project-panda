import React, { useState } from 'react';
import { Users, MessageSquare, Video, UserPlus, Check, X, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useServer } from '../../context/ServerContext';
import { MessageFeed } from '../chat/MessageFeed';
import { ChatInput } from '../chat/ChatInput';

export const DirectMessagesView = () => {
  const { currentUser, allUsers } = useAuth();
  const { activeDMUser, setActiveDMUser } = useServer();

  const [activeTab, setActiveTab] = useState('online'); // 'online' | 'all' | 'pending' | 'add'
  const [searchQuery, setSearchQuery] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  const friends = allUsers.filter(u => currentUser && u.id !== currentUser.id);

  const filteredFriends = friends.filter(f => {
    const matchesSearch = f.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.username.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'online') return matchesSearch && f.status !== 'offline';
    return matchesSearch;
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-chat)' }}>
      {/* Friends Header */}
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: 'var(--text-header)' }}>
            <Users size={20} /> Friends
          </div>

          <div style={{ display: 'flex', gap: '8px', borderLeft: '1px solid var(--bg-hover)', paddingLeft: '16px' }}>
            <button 
              className={`btn ${activeTab === 'online' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setActiveTab('online'); setActiveDMUser(null); }}
              style={{ padding: '6px 12px', fontSize: '13px' }}
            >
              Online
            </button>
            <button 
              className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setActiveTab('all'); setActiveDMUser(null); }}
              style={{ padding: '6px 12px', fontSize: '13px' }}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {activeDMUser ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100% - 48px)' }}>
          <div style={{
            padding: '12px 16px',
            background: 'var(--bg-sidebar)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid rgba(0,0,0,0.2)'
          }}>
            <img 
              src={activeDMUser.avatar} 
              alt={activeDMUser.displayName} 
              style={{ width: '36px', height: '36px', borderRadius: '50%' }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: '700', color: 'var(--text-header)' }}>
                {activeDMUser.displayName || activeDMUser.username}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {activeDMUser.customStatus || `@${activeDMUser.username}`}
              </span>
            </div>
            <button 
              className="btn btn-secondary" 
              style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: '12px' }}
              onClick={() => setActiveDMUser(null)}
            >
              Back to Friends List
            </button>
          </div>

          <MessageFeed onSetReply={setReplyTo} />
          <ChatInput replyTo={replyTo} onCancelReply={() => setReplyTo(null)} channelName={activeDMUser.displayName} />
        </div>
      ) : (
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {/* Search Input */}
          <div style={{
            background: 'var(--bg-input)',
            borderRadius: '8px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <Search size={18} style={{ color: 'var(--text-muted)' }} />
            <input 
              className="chat-input"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <h3 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
            {activeTab === 'online' ? `Online Friends — ${filteredFriends.length}` : `All Friends — ${filteredFriends.length}`}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredFriends.map((friend) => (
              <div 
                key={friend.id} 
                className="member-card"
                style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-sidebar)' }}
              >
                <div className="avatar-wrapper">
                  <img className="avatar-img" src={friend.avatar} alt={friend.displayName} />
                  <div className={`status-indicator ${friend.status}`} />
                </div>

                <div className="member-name-col" style={{ flex: 1, marginLeft: '8px' }}>
                  <span className="member-display-name">{friend.displayName || friend.username}</span>
                  <span className="member-custom-status">{friend.customStatus || `@${friend.username}`}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="icon-btn" 
                    title="Send Direct Message"
                    onClick={() => setActiveDMUser(friend)}
                  >
                    <MessageSquare size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
