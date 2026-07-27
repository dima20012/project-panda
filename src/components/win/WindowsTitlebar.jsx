import React from 'react';
import { Minus, Square, X, Radio } from 'lucide-react';

export const WindowsTitlebar = () => {
  const isElectron = !!window.electronAPI;

  const handleMinimize = () => {
    if (window.electronAPI) window.electronAPI.minimizeWindow();
  };

  const handleMaximize = () => {
    if (window.electronAPI) window.electronAPI.maximizeWindow();
  };

  const handleClose = () => {
    if (window.electronAPI) window.electronAPI.closeWindow();
  };

  return (
    <div className="win-titlebar">
      <div className="win-titlebar-title">
        <Radio size={16} style={{ color: 'var(--neon-cyan)' }} />
        <span>AETHER NODE</span>
        <span className="win-node-badge">🟢 LOCAL NODE ACTIVE • 0.8ms LAN</span>
      </div>

      {isElectron && (
        <div className="win-controls">
          <button className="win-btn" onClick={handleMinimize} title="Minimize">
            <Minus size={14} />
          </button>
          <button className="win-btn" onClick={handleMaximize} title="Maximize">
            <Square size={12} />
          </button>
          <button className="win-btn close-btn" onClick={handleClose} title="Close">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
