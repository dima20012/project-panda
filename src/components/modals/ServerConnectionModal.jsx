import React, { useState, useEffect } from 'react';
import { Server, Wifi, Check, X, RefreshCw, Globe, ShieldCheck } from 'lucide-react';
import { getServerUrl, setServerUrl, pingServerNode, DEFAULT_SERVER_URL } from '../../utils/apiConfig';

export const ServerConnectionModal = ({ onClose }) => {
  const [currentUrl, setCurrentUrl] = useState(() => getServerUrl());
  const [customUrl, setCustomUrl] = useState(() => getServerUrl());
  const [pingResult, setPingResult] = useState(null);
  const [pinging, setPinging] = useState(false);

  const handleTestPing = async (urlToTest = null) => {
    setPinging(true);
    const target = urlToTest || customUrl;
    const res = await pingServerNode(target);
    setPingResult(res);
    setPinging(false);
  };

  useEffect(() => {
    handleTestPing(currentUrl);
  }, []);

  const handleConnect = (targetUrl = null) => {
    const finalUrl = targetUrl || customUrl;
    setServerUrl(finalUrl);
    window.location.reload(); // Full reload to re-initialize Sockets & Auth to new Server Node
  };

  const PRESET_NODES = [
    { name: 'Local Embedded Node', url: DEFAULT_SERVER_URL, desc: 'Built-in local node running on your PC' },
    { name: 'LAN Node Host', url: 'http://192.168.1.100:3001', desc: 'Home server running on your local network' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '620px', maxWidth: '90vw' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} style={{ color: 'var(--neon-cyan)' }} />
            Server Node Connection Manager (TeamSpeak / Self-Hosted)
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          {/* Active Node Status */}
          <div style={{ background: 'var(--bg-space)', padding: '14px', borderRadius: '8px', border: '1px solid var(--glass-border)', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--neon-cyan)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} /> CURRENTLY CONNECTED NODE
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{currentUrl}</div>
                {pingResult && pingResult.success && (
                  <div style={{ fontSize: '12px', color: 'var(--neon-emerald)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Wifi size={12} /> {pingResult.data.serverName} • {pingResult.latency}ms LAN • {pingResult.data.usersOnline} Users Online
                  </div>
                )}
              </div>
              <button className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => handleTestPing(currentUrl)}>
                <RefreshCw size={12} style={{ marginRight: '4px' }} /> Ping
              </button>
            </div>
          </div>

          {/* Preset Server Nodes */}
          <div className="form-group">
            <label className="form-label">Quick Connect Presets</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {PRESET_NODES.map((preset, idx) => {
                const isCurrent = currentUrl === preset.url;
                return (
                  <div
                    key={idx}
                    style={{
                      background: isCurrent ? 'rgba(0, 242, 254, 0.12)' : 'var(--bg-surface)',
                      border: isCurrent ? '1px solid var(--neon-cyan)' : '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setCustomUrl(preset.url);
                      handleTestPing(preset.url);
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{preset.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{preset.url} — {preset.desc}</div>
                    </div>
                    {isCurrent ? (
                      <span style={{ fontSize: '11px', color: 'var(--neon-emerald)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} /> Active
                      </span>
                    ) : (
                      <button className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={(e) => { e.stopPropagation(); handleConnect(preset.url); }}>
                        Connect
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Remote Server Node Form */}
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Connect to Custom Remote Server Host</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="form-input"
                placeholder="e.g. http://192.168.1.100:3001 or https://panda.mycommunity.com"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn btn-secondary" onClick={() => handleTestPing()} disabled={pinging}>
                {pinging ? 'Testing...' : 'Test Ping'}
              </button>
            </div>
          </div>

          {/* Ping Test Result Banner */}
          {pingResult && (
            <div style={{
              background: pingResult.success ? 'rgba(0, 255, 135, 0.1)' : 'rgba(255, 42, 95, 0.1)',
              border: `1px solid ${pingResult.success ? 'var(--neon-emerald)' : 'var(--neon-crimson)'}`,
              borderRadius: '8px',
              padding: '12px',
              marginTop: '12px',
              fontSize: '12px'
            }}>
              {pingResult.success ? (
                <div>
                  <div style={{ fontWeight: '700', color: 'var(--neon-emerald)', marginBottom: '4px' }}>
                    🟢 Server Node Online ({pingResult.latency}ms Latency)
                  </div>
                  <div style={{ color: 'var(--text-primary)' }}>
                    <strong>Name:</strong> {pingResult.data.serverName} | <strong>Version:</strong> v{pingResult.data.version}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>
                    {pingResult.data.motd}
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--neon-crimson)', fontWeight: '700' }}>
                  🔴 Server Unreachable: {pingResult.error}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className="btn btn-primary" 
            onClick={() => handleConnect()}
            disabled={pingResult && !pingResult.success}
          >
            Connect to Server Node
          </button>
        </div>
      </div>
    </div>
  );
};
