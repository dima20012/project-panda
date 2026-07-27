import React, { useState, useRef } from 'react';
import { Paperclip, Smile, Send, X, Image as ImageIcon } from 'lucide-react';
import { useServer } from '../../context/ServerContext';

const POPULAR_EMOJIS = ['😊', '😂', '🔥', '👍', '❤️', '🚀', '🎉', '🎮', '💻', '✨', '🙌', '💯'];

export const ChatInput = ({ replyTo, onCancelReply, channelName }) => {
  const { sendMessage, sendTyping } = useServer();
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  const handleSend = () => {
    if (!text.trim() && !attachment) return;
    sendMessage(text, attachment, replyTo);
    setText('');
    setAttachment(null);
    if (onCancelReply) onCancelReply();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const fileData = await res.json();
        setAttachment(fileData);
      }
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="chat-input-wrapper">
      {/* Reply Banner */}
      {replyTo && (
        <div style={{
          background: 'var(--bg-sidebar)',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--text-muted)',
          borderLeft: '3px solid var(--brand)'
        }}>
          <span>Replying to <strong style={{ color: 'var(--text-header)' }}>{replyTo.authorName}</strong></span>
          <X size={14} style={{ cursor: 'pointer' }} onClick={onCancelReply} />
        </div>
      )}

      {/* Attachment Preview Banner */}
      {attachment && (
        <div style={{
          background: 'var(--bg-sidebar)',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: 'var(--text-normal)'
        }}>
          <ImageIcon size={16} />
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {attachment.filename} ({Math.round(attachment.size / 1024)} KB)
          </span>
          <X size={16} style={{ cursor: 'pointer' }} onClick={() => setAttachment(null)} />
        </div>
      )}

      {/* Main Input Box */}
      <div className="chat-input-container">
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileUpload} 
        />
        <button 
          className="icon-btn" 
          title="Attach File"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Paperclip size={20} />
        </button>

        <input
          className="chat-input"
          placeholder={uploading ? 'Uploading attachment...' : `Message #${channelName || 'general'}`}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            sendTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        <div style={{ position: 'relative' }}>
          <button 
            className="icon-btn" 
            title="Insert Emoji"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={20} />
          </button>

          {showEmojiPicker && (
            <div style={{
              position: 'absolute',
              bottom: '40px',
              right: '0',
              background: 'var(--bg-sidebar)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              padding: '10px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              boxShadow: 'var(--shadow-main)',
              zIndex: 30
            }}>
              {POPULAR_EMOJIS.map(emoji => (
                <span
                  key={emoji}
                  style={{ fontSize: '20px', cursor: 'pointer', textAlign: 'center' }}
                  onClick={() => {
                    setText(prev => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          )}
        </div>

        <button className="icon-btn" style={{ color: 'var(--brand)' }} onClick={handleSend} title="Send">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
