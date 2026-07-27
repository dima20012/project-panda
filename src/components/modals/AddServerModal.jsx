import React, { useState } from 'react';
import { useServer } from '../../context/ServerContext';

const EMOJI_OPTIONS = ['💬', '🎮', '⚡', '🚀', '🎨', '🔥', '🎵', '💻'];

export const AddServerModal = ({ onClose }) => {
  const { createServer, joinServerByInvite } = useServer();
  const [tab, setTab] = useState('create'); // 'create' | 'join'
  const [serverName, setServerName] = useState('');
  const [icon, setIcon] = useState('💬');
  const [description, setDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!serverName.trim()) {
      setError('Please enter a server name');
      return;
    }
    await createServer(serverName, icon, description);
    onClose();
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }
    const res = await joinServerByInvite(inviteCode);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to join server');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Create or Join a Server</div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button 
              className={`btn ${tab === 'create' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setTab('create'); setError(''); }}
              style={{ fontSize: '13px', padding: '6px 12px' }}
            >
              Create Server
            </button>
            <button 
              className={`btn ${tab === 'join' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setTab('join'); setError(''); }}
              style={{ fontSize: '13px', padding: '6px 12px' }}
            >
              Join Server
            </button>
          </div>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ background: 'rgba(242, 63, 67, 0.15)', border: '1px solid #f23f43', color: '#f23f43', padding: '8px 12px', borderRadius: '6px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {tab === 'create' ? (
            <>
              <div className="form-group">
                <label className="form-label">Choose Server Icon</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {EMOJI_OPTIONS.map(e => (
                    <button 
                      key={e} 
                      className={`server-icon ${icon === e ? 'active' : ''}`}
                      onClick={() => setIcon(e)}
                      style={{ width: '38px', height: '38px', fontSize: '18px' }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Server Name</label>
                <input 
                  className="form-input" 
                  placeholder="e.g. My Local Lounge" 
                  value={serverName} 
                  onChange={(e) => setServerName(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Server Description</label>
                <input 
                  className="form-input" 
                  placeholder="What is this server about?" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                />
              </div>
            </>
          ) : (
            <div className="form-group">
              <label className="form-label">Invite Code</label>
              <input 
                className="form-input" 
                placeholder="e.g. HARMONY-LOCAL-2026" 
                value={inviteCode} 
                onChange={(e) => setInviteCode(e.target.value)} 
              />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Enter an invite code to join a local server on this node.
              </span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={tab === 'create' ? handleCreate : handleJoin}>
            {tab === 'create' ? 'Create Server' : 'Join Server'}
          </button>
        </div>
      </div>
    </div>
  );
};
