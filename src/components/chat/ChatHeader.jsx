import React from 'react';
import { Hash, Volume2, Users, Search, Download } from 'lucide-react';
import { useServer } from '../../context/ServerContext';

export const ChatHeader = ({ onToggleMembers, showMembers, onOpenSearch }) => {
  const { activeChannel, typingUsers, messages } = useServer();

  if (!activeChannel) return null;

  const isText = activeChannel.type === 'text';

  const handleExportChat = () => {
    if (!messages || messages.length === 0) return;
    const header = `# 🐼 Chat History Export — #${activeChannel.name}\nExported on: ${new Date().toLocaleString()}\n\n---\n\n`;
    const body = messages.map(m => {
      const time = new Date(m.timestamp).toLocaleString();
      return `**[${time}] ${m.authorName || m.senderId}**: ${m.content}`;
    }).join('\n\n');

    const blob = new Blob([header + body], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `panda_chat_${activeChannel.name}_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="chat-header">
      <div className="chat-header-title">
        {isText ? <Hash size={20} style={{ color: 'var(--text-muted)' }} /> : <Volume2 size={20} style={{ color: 'var(--neon-emerald)' }} />}
        <span>{activeChannel.name}</span>
        {activeChannel.topic && (
          <span className="chat-header-topic">
            {activeChannel.topic}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}

        <button 
          className="icon-btn" 
          onClick={handleExportChat}
          title="Export Chat History (Markdown)"
        >
          <Download size={18} />
        </button>

        <button 
          className="icon-btn" 
          onClick={onOpenSearch}
          title="Search (Ctrl + K)"
        >
          <Search size={18} />
        </button>

        <button 
          className={`icon-btn ${showMembers ? 'active' : ''}`} 
          onClick={onToggleMembers}
          title="Toggle Member List"
        >
          <Users size={18} />
        </button>
      </div>
    </div>
  );
};
