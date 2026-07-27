import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

export const ImageLightboxModal = ({ imageUrl, filename, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 3000, background: 'rgba(0, 0, 0, 0.9)' }}>
      <div 
        style={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div style={{
          display: 'flex',
          justify: 'space-between',
          width: '100%',
          marginBottom: '12px',
          color: 'white',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          <span>{filename || 'Image Attachment'}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a 
              href={imageUrl} 
              download={filename || 'image'} 
              target="_blank" 
              rel="noreferrer"
              className="icon-btn"
              title="Open Original Image"
              style={{ color: 'white' }}
            >
              <ExternalLink size={18} />
            </a>
            <button className="icon-btn close-btn" onClick={onClose} title="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* High-Res Image */}
        <img 
          src={imageUrl} 
          alt={filename || 'Attachment'} 
          style={{
            maxWidth: '100%',
            maxHeight: '80vh',
            objectFit: 'contain',
            borderRadius: '12px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            border: '1px solid var(--glass-border)'
          }}
        />
      </div>
    </div>
  );
};
