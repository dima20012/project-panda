import React, { useState, useRef } from 'react';
import { Paperclip, Smile, Send, X, Image as ImageIcon, Bold, Italic, Code, EyeOff } from 'lucide-react';
import { useServer } from '../../context/ServerContext';
import { getServerUrl } from '../../utils/apiConfig';

const POPULAR_EMOJIS = ['😊', '😂', '🔥', '👍', '❤️', '🚀', '🎉', '🎮', '💻', '✨', '🙌', '💯'];

export const ChatInput = ({ replyTo, onCancelReply, channelName }) => {
  const { sendMessage, sendTyping } = useServer();
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleSend = () => {
    if (!text.trim() && !attachment) return;
    sendMessage(text, attachment, replyTo);
    setText('');
    setAttachment(null);
    if (onCancelReply) onCancelReply();
  };

  const processUploadFile = async (file) => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const baseUrl = getServerUrl();
      const res = await fetch(`${baseUrl}/api/upload`, {
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    processUploadFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFormatText = (prefix, suffix) => {
    setText(prev => `${prev}${prefix}text${suffix}`);
  };

  return (
    <div 
      className="chat-input-wrapper"
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      style={{
        border: isDragOver ? '2px dashed var(--neon-cyan)' : 'none',
        borderRadius: '8px',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 242, 254, 0.15)',
          backdropFilter: 'blur(4px)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--neon-cyan)',
          fontWeight: '700',
          fontSize: '14px',
          zIndex: 40,
          pointerEvents: 'none'
        }}>
          📥 Drop file to attach to #{channelName || 'general'}
        </div>
      )}

      {/* Reply Banner */}
      {replyTo && (
        <div style={{
          background: 'var(--bg-surface)',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--text-muted)',
          borderLeft: '3px solid var(--neon-cyan)'
        }}>
          <span>Replying to <strong style={{ color: 'var(--text-primary)' }}>{replyTo.authorName}</strong></span>
          <X size={14} style={{ cursor: 'pointer' }} onClick={onCancelReply} />
        </div>
      )}

      {/* Attachment Preview Banner */}
      {attachment && (
        <div style={{
          background: 'var(--bg-surface)',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: 'var(--text-primary)'
        }}>
          <ImageIcon size={16} style={{ color: 'var(--neon-cyan)' }} />
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {attachment.filename} ({Math.round(attachment.size / 1024)} KB)
          </span>
          <X size={16} style={{ cursor: 'pointer' }} onClick={() => setAttachment(null)} />
        </div>
      )}

      {/* Main Input Box */}
      <div className="chat-input-container" style={{ position: 'relative' }}>
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
          <Paperclip size={18} />
        </button>

        {/* Text Format Quick Toolbar */}
        <div style={{ display: 'flex', gap: '2px', alignItems: 'center', marginRight: '4px' }}>
          <button className="icon-btn" title="Bold (**text**)" onClick={() => handleFormatText('**', '**')}>
            <Bold size={15} />
          </button>
          <button className="icon-btn" title="Italic (*text*)" onClick={() => handleFormatText('*', '*')}>
            <Italic size={15} />
          </button>
          <button className="icon-btn" title="Inline Code (`text`)" onClick={() => handleFormatText('`', '`')}>
            <Code size={15} />
          </button>
          <button className="icon-btn" title="Spoiler (||text||)" onClick={() => handleFormatText('||', '||')}>
            <EyeOff size={15} />
          </button>
        </div>

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
            <Smile size={18} />
          </button>

          {showEmojiPicker && (
            <div style={{
              position: 'absolute',
              bottom: '40px',
              right: '0',
              background: 'var(--bg-surface)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              padding: '10px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              boxShadow: 'var(--glass-shadow)',
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

        <button className="icon-btn" style={{ color: 'var(--neon-cyan)' }} onClick={handleSend} title="Send Message">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
