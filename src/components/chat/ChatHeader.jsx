import React from 'react';
import { Hash, Volume2, Users, Pin, Search } from 'lucide-react';
import { useServer } from '../../context/ServerContext';

export const ChatHeader = ({ onToggleMembers, showMembers }) => {
  const { activeChannel, typingUsers } = useServer();

  if (!activeChannel) return null;

  const isText = activeChannel.type === 'text';

  return (
    <div className="chat-header">
      <div className="chat-header-title">
        {isText ? <Hash size={20} style={{ color: 'var(--text-muted)' }} /> : <Volume2 size={20} style={{ color: '#57F287' }} />}
        <span>{activeChannel.name}</span>
        {activeChannel.topic && (
          <span className="chat-header-topic">
            {activeChannel.topic}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}

        <button 
          className={`icon-btn ${showMembers ? 'active' : ''}`} 
          onClick={onToggleMembers}
          title="Toggle Member List"
        >
          <Users size={20} />
        </button>
      </div>
    </div>
  );
};
