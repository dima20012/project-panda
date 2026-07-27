import React from 'react';
import { MessageSquare, Plus, Compass } from 'lucide-react';
import { useServer } from '../../context/ServerContext';

export const ServersBar = ({ onOpenAddServer }) => {
  const { servers, activeServerId, setActiveServerId } = useServer();

  return (
    <div className="servers-bar">
      {/* Home / Direct Messages Icon */}
      <div 
        className={`server-icon home-btn ${activeServerId === 'home' ? 'active' : ''}`}
        onClick={() => setActiveServerId('home')}
        title="Direct Messages"
      >
        <div className="server-pill"></div>
        <MessageSquare size={24} />
      </div>

      <div className="servers-separator"></div>

      {/* Server List */}
      {servers.map((server) => {
        const isActive = activeServerId === server.id;
        return (
          <div
            key={server.id}
            className={`server-icon ${isActive ? 'active' : ''}`}
            style={{ background: server.iconBg || '#5865F2' }}
            onClick={() => setActiveServerId(server.id)}
            title={server.name}
          >
            <div className="server-pill"></div>
            {server.icon ? (
              <span>{server.icon}</span>
            ) : (
              <span>{server.name.substring(0, 2).toUpperCase()}</span>
            )}
          </div>
        );
      })}

      {/* Add Server Button */}
      <div 
        className="server-icon add-btn"
        onClick={onOpenAddServer}
        title="Add or Join a Server"
      >
        <Plus size={24} />
      </div>
    </div>
  );
};
