import React, { useState } from 'react';
import { Smile, Reply, Edit3, Trash2, Pin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useServer } from '../../context/ServerContext';
import { MarkdownText } from './MarkdownText';
import { ImageLightboxModal } from '../modals/ImageLightboxModal';

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '🎉', '🎮', '🚀', '😂', '💯'];

export const MessageFeed = ({ onSetReply }) => {
  const { messages, toggleReaction, editMessage, deleteMessage } = useServer();
  const { currentUser, allUsers } = useAuth();

  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editText, setEditText] = useState('');
  const [emojiPickerMsgId, setEmojiPickerMsgId] = useState(null);
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);

  const handleStartEdit = (msg) => {
    setEditingMsgId(msg.id);
    setEditText(msg.content);
  };

  const handleSaveEdit = (msgId) => {
    if (editText.trim()) {
      editMessage(msgId, editText);
    }
    setEditingMsgId(null);
  };

  return (
    <div className="messages-container">
      {messages.length === 0 ? (
        <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🐼</div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>Welcome to the channel!</h3>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>This is the start of your message history.</p>
        </div>
      ) : (
        messages.map((msg) => {
          const author = allUsers.find(u => u.id === msg.authorId || u.id === msg.senderId) || {
            displayName: 'Unknown User',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          };
          const isOwner = currentUser && (msg.authorId === currentUser.id || msg.senderId === currentUser.id);

          return (
            <div key={msg.id} className="message-group">
              {/* Avatar */}
              <img className="message-avatar" src={author.avatar} alt={author.displayName} />

              <div className="message-content-wrapper">
                {/* Reply preview if replyTo exists */}
                {msg.replyTo && (
                  <div className="message-reply-quote">
                    <span>↪ Replying to <strong style={{ color: 'var(--text-primary)' }}>{msg.replyTo.authorName}</strong>:</span>
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                      {msg.replyTo.content}
                    </span>
                  </div>
                )}

                {/* Message Header */}
                <div className="message-header">
                  <span className="message-author">{author.displayName || author.username}</span>
                  <span className="message-timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.edited && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(edited)</span>}
                  {msg.pinned && <Pin size={12} style={{ color: 'var(--neon-cyan)' }} title="Pinned Message" />}
                </div>

                {/* Message Text / Edit Input */}
                {editingMsgId === msg.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    <input
                      className="form-input"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(msg.id);
                        if (e.key === 'Escape') setEditingMsgId(null);
                      }}
                      autoFocus
                    />
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      escape to cancel • enter to save
                    </div>
                  </div>
                ) : (
                  <div className="message-text">
                    <MarkdownText content={msg.content} />
                  </div>
                )}

                {/* File Attachment */}
                {msg.attachment && (
                  <div style={{ marginTop: '6px' }}>
                    {msg.attachment.mimetype?.startsWith('image/') ? (
                      <img 
                        className="message-attachment" 
                        src={msg.attachment.url} 
                        alt="Attachment" 
                        onClick={() => setActiveLightboxImage({ url: msg.attachment.url, filename: msg.attachment.filename })}
                        style={{ cursor: 'pointer' }}
                        title="Click to view full image"
                      />
                    ) : msg.attachment.mimetype?.startsWith('audio/') || msg.attachment.filename?.match(/\.(mp3|wav|ogg|aac|flac)$/i) ? (
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'inline-block' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>🎵 {msg.attachment.filename}</div>
                        <audio controls src={msg.attachment.url} style={{ height: '36px', outline: 'none' }} />
                      </div>
                    ) : msg.attachment.mimetype?.startsWith('video/') || msg.attachment.filename?.match(/\.(mp4|webm|mkv|mov)$/i) ? (
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'inline-block' }}>
                        <video controls src={msg.attachment.url} style={{ maxWidth: '420px', maxHeight: '280px', borderRadius: '6px' }} />
                      </div>
                    ) : (
                      <a 
                        href={msg.attachment.url} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ color: 'var(--neon-cyan)', fontSize: '13px', textDecoration: 'underline', marginTop: '6px', display: 'inline-block' }}
                      >
                        📎 {msg.attachment.filename} ({Math.round(msg.attachment.size / 1024)} KB)
                      </a>
                    )}
                  </div>
                )}

                {/* Reactions */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="message-reactions">
                    {Object.entries(msg.reactions).map(([emoji, users]) => {
                      const userReacted = currentUser && users.includes(currentUser.id);
                      return (
                        <div
                          key={emoji}
                          className={`reaction-badge ${userReacted ? 'user-reacted' : ''}`}
                          onClick={() => toggleReaction(msg.id, emoji)}
                        >
                          <span>{emoji}</span>
                          <span style={{ fontWeight: '700', fontSize: '12px' }}>{users.length}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Floating Action Toolbar on Hover */}
              <div className="message-actions">
                <button 
                  className="icon-btn" 
                  title="Add Reaction"
                  onClick={() => setEmojiPickerMsgId(emojiPickerMsgId === msg.id ? null : msg.id)}
                >
                  <Smile size={16} />
                </button>
                <button 
                  className="icon-btn" 
                  title="Reply"
                  onClick={() => onSetReply({ id: msg.id, authorName: author.displayName || author.username, content: msg.content })}
                >
                  <Reply size={16} />
                </button>

                {isOwner && (
                  <>
                    <button className="icon-btn" title="Edit Message" onClick={() => handleStartEdit(msg)}>
                      <Edit3 size={16} />
                    </button>
                    <button className="icon-btn active-danger" title="Delete Message" onClick={() => deleteMessage(msg.id)}>
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>

              {/* Emoji Picker Popup */}
              {emojiPickerMsgId === msg.id && (
                <div style={{
                  position: 'absolute',
                  top: '-42px',
                  right: '16px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  display: 'flex',
                  gap: '6px',
                  boxShadow: 'var(--glass-shadow)',
                  zIndex: 20
                }}>
                  {QUICK_EMOJIS.map(emoji => (
                    <span
                      key={emoji}
                      style={{ cursor: 'pointer', fontSize: '18px' }}
                      onClick={() => {
                        toggleReaction(msg.id, emoji);
                        setEmojiPickerMsgId(null);
                      }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Image Lightbox Modal */}
      {activeLightboxImage && (
        <ImageLightboxModal 
          imageUrl={activeLightboxImage.url}
          filename={activeLightboxImage.filename}
          onClose={() => setActiveLightboxImage(null)}
        />
      )}
    </div>
  );
};
