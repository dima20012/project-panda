import React, { useState, useEffect } from 'react';
import { Monitor, X } from 'lucide-react';

export const ScreenShareModal = ({ onClose, onSelectSource }) => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        if (window.electronAPI && window.electronAPI.getDesktopSources) {
          const desktopSources = await window.electronAPI.getDesktopSources();
          setSources(desktopSources || []);
        }
      } catch (err) {
        console.error('Error fetching desktop sources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSources();
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '620px', maxWidth: '90vw' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Monitor size={18} style={{ color: 'var(--neon-cyan)' }} />
            Select Screen or Application to Share
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              Scanning desktop windows & displays...
            </div>
          ) : sources.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              <p>No desktop sources detected or browser environment.</p>
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '12px' }}
                onClick={() => {
                  onSelectSource(null); // Fallback to browser getDisplayMedia
                  onClose();
                }}
              >
                Use Browser Screen Capture
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {sources.map(src => (
                <div
                  key={src.id}
                  style={{
                    background: 'var(--bg-space)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--neon-cyan)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                  onClick={() => {
                    onSelectSource(src.id);
                    onClose();
                  }}
                >
                  <img 
                    src={src.thumbnail} 
                    alt={src.name} 
                    style={{ width: '100%', height: '120px', objectFit: 'contain', borderRadius: '4px', background: '#000' }} 
                  />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {src.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};
