import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Shield, Sparkles } from 'lucide-react';

export const UserSettingsModal = ({ onClose }) => {
  const { currentUser, allUsers, switchUser, updateUserProfile } = useAuth();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [customStatus, setCustomStatus] = useState(currentUser?.customStatus || '');
  const [status, setStatus] = useState(currentUser?.status || 'online');

  const handleSave = async () => {
    await updateUserProfile({
      displayName,
      avatar,
      customStatus,
      status
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '560px' }}>
        <div className="modal-header">
          <div className="modal-title">User Settings & Account Profile</div>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Quick Account Switcher (For Local Multi-User Testing) */}
          <div style={{ background: 'var(--bg-darkest)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--brand-light)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} /> LOCAL TESTING IDENTITY SWITCHER
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {allUsers.map(u => {
                const isSelected = u.id === currentUser?.id;
                return (
                  <div
                    key={u.id}
                    className="member-card"
                    style={{
                      background: isSelected ? 'rgba(88, 101, 242, 0.25)' : 'var(--bg-sidebar)',
                      border: isSelected ? '1px solid var(--brand)' : '1px solid transparent',
                      padding: '8px'
                    }}
                    onClick={() => {
                      switchUser(u);
                      setDisplayName(u.displayName);
                      setAvatar(u.avatar);
                      setCustomStatus(u.customStatus || '');
                      setStatus(u.status || 'online');
                    }}
                  >
                    <img src={u.avatar} alt={u.displayName} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-header)' }}>
                      {u.displayName}
                    </span>
                    {isSelected && <UserCheck size={14} style={{ color: '#57F287', marginLeft: 'auto' }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Profile Form */}
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input 
              className="form-input" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Avatar Image URL</label>
            <input 
              className="form-input" 
              value={avatar} 
              onChange={(e) => setAvatar(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Custom Status Message</label>
            <input 
              className="form-input" 
              placeholder="e.g. 🚀 Building awesome local apps" 
              value={customStatus} 
              onChange={(e) => setCustomStatus(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status Indicator</label>
            <select 
              className="form-input" 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="online">🟢 Online</option>
              <option value="idle">🟡 Idle</option>
              <option value="dnd">🔴 Do Not Disturb</option>
              <option value="offline">⚪ Invisible</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};
