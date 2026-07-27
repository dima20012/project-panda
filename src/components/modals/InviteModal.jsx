import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useServer } from '../../context/ServerContext';

export const InviteModal = ({ onClose }) => {
  const { activeServer } = useServer();
  const [copied, setCopied] = useState(false);

  if (!activeServer) return null;

  const inviteCode = activeServer.inviteCode || 'HARMONY-LOCAL-2026';

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Invite Friends to {activeServer.name}</div>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Server Invite Code</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input className="form-input" value={inviteCode} readOnly style={{ flex: 1, fontWeight: '700' }} />
              <button className="btn btn-primary" onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Share this code with friends on your local network to let them join this server!
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};
