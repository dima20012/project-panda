import React, { useState } from 'react';
import { Hash, Volume2 } from 'lucide-react';
import { useServer } from '../../context/ServerContext';

export const CreateChannelModal = ({ categoryId, onClose }) => {
  const { activeServerId, createChannel } = useServer();
  const [name, setName] = useState('');
  const [type, setType] = useState('text'); // 'text' | 'voice'
  const [topic, setTopic] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createChannel(activeServerId, categoryId, name, type, topic);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Create Channel</div>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Channel Type</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div 
                className={`channel-item ${type === 'text' ? 'active' : ''}`}
                style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
                onClick={() => setType('text')}
              >
                <Hash size={20} /> Text Channel
              </div>
              <div 
                className={`channel-item ${type === 'voice' ? 'active' : ''}`}
                style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
                onClick={() => setType('voice')}
              >
                <Volume2 size={20} /> Voice Channel
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Channel Name</label>
            <input 
              className="form-input"
              placeholder="e.g. general-chat"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {type === 'text' && (
            <div className="form-group">
              <label className="form-label">Channel Topic (Optional)</label>
              <input 
                className="form-input"
                placeholder="What is this channel about?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate}>Create Channel</button>
        </div>
      </div>
    </div>
  );
};
