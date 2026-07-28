import React from 'react';
import { Pin, X, Trash2 } from 'lucide-react';
import { useServer } from '../../context/ServerContext';
import { MarkdownText } from '../chat/MarkdownText';

export const PinnedModal = ({ onClose }) => {
  const { messages, activeChannel } = useServer();

  const pinnedMessages = messages.filter(m => m.pinned);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '580px', maxWidth: '90vw' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Pin size={18} style={{ color: 'var(--neon-cyan)' }} />
            Pinned Messages — #{activeChannel?.name || 'general'}
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {pinnedMessages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
              <Pin size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <div>No pinned messages in this channel yet.</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>Hover over any message and click the pin icon to keep announcements handy.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pinnedMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  style={{
                    background: 'var(--bg-space)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '12px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '700', fontSize: '13px', color: 'var(--neon-cyan)' }}>
                      {msg.authorName || msg.senderId}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    <MarkdownText content={msg.content} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};
