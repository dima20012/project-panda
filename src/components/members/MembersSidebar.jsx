import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useServer } from '../../context/ServerContext';
import { MessageSquare, Shield } from 'lucide-react';

export const MembersSidebar = () => {
  const { allUsers } = useAuth();
  const { setActiveServerId, setActiveDMUser } = useServer();
  const [selectedUser, setSelectedUser] = useState(null);

  const onlineMembers = allUsers.filter(u => u.status === 'online');
  const awayMembers = allUsers.filter(u => u.status === 'idle' || u.status === 'dnd');
  const offlineMembers = allUsers.filter(u => u.status === 'offline');

  const handleStartDM = (user) => {
    setActiveServerId('home');
    setActiveDMUser(user);
    setSelectedUser(null);
  };

  return (
    <div className="members-sidebar">
      {/* Online Section */}
      {onlineMembers.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div className="member-group-title">
            ONLINE — {onlineMembers.length}
          </div>
          {onlineMembers.map(user => (
            <div key={user.id} className="member-card" onClick={() => setSelectedUser(user)}>
              <div className="avatar-wrapper">
                <img className="avatar-img" src={user.avatar} alt={user.displayName} />
                <div className={`status-indicator ${user.status}`} />
              </div>
              <div className="member-name-col">
                <span className="member-display-name">{user.displayName || user.username}</span>
                {user.customStatus && <span className="member-custom-status">{user.customStatus}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Away/DND Section */}
      {awayMembers.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div className="member-group-title">
            AWAY / DND — {awayMembers.length}
          </div>
          {awayMembers.map(user => (
            <div key={user.id} className="member-card" onClick={() => setSelectedUser(user)}>
              <div className="avatar-wrapper">
                <img className="avatar-img" src={user.avatar} alt={user.displayName} />
                <div className={`status-indicator ${user.status}`} />
              </div>
              <div className="member-name-col">
                <span className="member-display-name">{user.displayName || user.username}</span>
                {user.customStatus && <span className="member-custom-status">{user.customStatus}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Offline Section */}
      {offlineMembers.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div className="member-group-title">
            OFFLINE — {offlineMembers.length}
          </div>
          {offlineMembers.map(user => (
            <div key={user.id} className="member-card" style={{ opacity: 0.6 }} onClick={() => setSelectedUser(user)}>
              <div className="avatar-wrapper">
                <img className="avatar-img" src={user.avatar} alt={user.displayName} />
                <div className={`status-indicator ${user.status}`} />
              </div>
              <div className="member-name-col">
                <span className="member-display-name">{user.displayName || user.username}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Profile Popover Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '340px' }}>
            <div style={{
              height: '80px',
              background: selectedUser.bannerColor || '#5865F2',
              position: 'relative'
            }}>
              <img 
                src={selectedUser.avatar} 
                alt={selectedUser.displayName} 
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  position: 'absolute',
                  bottom: '-20px',
                  left: '16px',
                  border: '4px solid var(--bg-sidebar)'
                }}
              />
            </div>
            <div className="modal-body" style={{ paddingTop: '28px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-header)' }}>
                  {selectedUser.displayName}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{selectedUser.username}</span>
              </div>

              {selectedUser.customStatus && (
                <div style={{ background: 'var(--bg-darkest)', padding: '8px 12px', borderRadius: '6px', fontSize: '13px' }}>
                  {selectedUser.customStatus}
                </div>
              )}

              {selectedUser.roles && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Roles
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {selectedUser.roles.map(role => (
                      <span key={role} style={{
                        background: 'rgba(88, 101, 242, 0.2)',
                        color: 'var(--brand-light)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        <Shield size={10} style={{ marginRight: '4px' }} /> {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} onClick={() => handleStartDM(selectedUser)}>
                <MessageSquare size={16} /> Send Direct Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
