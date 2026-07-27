import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useVoice } from '../../context/VoiceContext';
import { UserCheck, Sparkles, Palette, User, Keyboard, Mic, Volume2, Video } from 'lucide-react';

export const UserSettingsModal = ({ onClose }) => {
  const { currentUser, allUsers, switchUser, updateUserProfile } = useAuth();
  const { 
    theme, 
    setTheme, 
    blurIntensity, 
    setBlurIntensity, 
    glowIntensity, 
    setGlowIntensity, 
    fontScale, 
    setFontScale, 
    compactMode, 
    setCompactMode, 
    THEME_PRESETS 
  } = useTheme();

  const {
    audioInputDevices,
    audioOutputDevices,
    videoInputDevices,
    selectedAudioInput,
    setSelectedAudioInput,
    selectedAudioOutput,
    setSelectedAudioOutput,
    selectedVideoInput,
    setSelectedVideoInput,
    noiseSuppression,
    setNoiseSuppression,
    echoCancellation,
    setEchoCancellation,
    autoGainControl,
    setAutoGainControl,
    refreshDevices
  } = useVoice();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'ui' | 'audio-video' | 'hotkeys'

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [customStatus, setCustomStatus] = useState(currentUser?.customStatus || '');
  const [status, setStatus] = useState(currentUser?.status || 'online');
  const [bio, setBio] = useState(currentUser?.bio || '');

  // Live Camera Preview Test State
  const [isTestCamActive, setIsTestCamActive] = useState(false);
  const testCamRef = useRef(null);
  const testStreamRef = useRef(null);

  useEffect(() => {
    refreshDevices();
  }, []);

  // Stop camera test preview on tab switch or modal close
  useEffect(() => {
    return () => {
      if (testStreamRef.current) {
        testStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const toggleTestCam = async () => {
    try {
      if (isTestCamActive) {
        if (testStreamRef.current) {
          testStreamRef.current.getTracks().forEach(t => t.stop());
          testStreamRef.current = null;
        }
        setIsTestCamActive(false);
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: selectedVideoInput !== 'default' ? { deviceId: { exact: selectedVideoInput } } : true
        });
        testStreamRef.current = stream;
        if (testCamRef.current) {
          testCamRef.current.srcObject = stream;
        }
        setIsTestCamActive(true);
      }
    } catch (e) {
      console.error('Test camera preview error:', e);
      setIsTestCamActive(false);
    }
  };

  const AVATAR_PRESETS = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=PandaNeon',
    'https://api.dicebear.com/7.x/bottts/svg?seed=CyberPanda',
    'https://api.dicebear.com/7.x/bottts/svg?seed=GhostNode',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Vanguard',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Quantum',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Hyperion'
  ];

  const handleSave = async () => {
    await updateUserProfile({
      displayName,
      avatar,
      customStatus,
      status,
      bio
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '680px', maxWidth: '92vw' }}>
        <div className="modal-header">
          <div className="modal-title">Settings & Customization</div>
          
          {/* Tab Bar */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
            <button
              className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '12px', padding: '6px 12px' }}
              onClick={() => setActiveTab('profile')}
            >
              <User size={14} style={{ marginRight: '4px' }} /> Profile & Identity
            </button>

            <button
              className={`btn ${activeTab === 'ui' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '12px', padding: '6px 12px' }}
              onClick={() => setActiveTab('ui')}
            >
              <Palette size={14} style={{ marginRight: '4px' }} /> UI & Aesthetics
            </button>

            <button
              className={`btn ${activeTab === 'audio-video' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '12px', padding: '6px 12px' }}
              onClick={() => setActiveTab('audio-video')}
            >
              <Mic size={14} style={{ marginRight: '4px' }} /> Audio & Video
            </button>

            <button
              className={`btn ${activeTab === 'hotkeys' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '12px', padding: '6px 12px' }}
              onClick={() => setActiveTab('hotkeys')}
            >
              <Keyboard size={14} style={{ marginRight: '4px' }} /> Hotkeys
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          {activeTab === 'profile' && (
            <>
              {/* Account Switcher */}
              <div style={{ background: 'var(--bg-space)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--neon-cyan)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} /> LOCAL TESTING MULTI-USER SWITCHER
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {allUsers.map(u => {
                    const isSelected = u.id === currentUser?.id;
                    return (
                      <div
                        key={u.id}
                        className="member-card"
                        style={{
                          background: isSelected ? 'rgba(0, 242, 254, 0.15)' : 'var(--bg-surface)',
                          border: isSelected ? '1px solid var(--neon-cyan)' : '1px solid transparent',
                          padding: '6px 10px',
                          cursor: 'pointer',
                          borderRadius: '6px'
                        }}
                        onClick={() => {
                          switchUser(u);
                          setDisplayName(u.displayName);
                          setAvatar(u.avatar);
                          setCustomStatus(u.customStatus || '');
                          setStatus(u.status || 'online');
                          setBio(u.bio || '');
                        }}
                      >
                        <img src={u.avatar} alt={u.displayName} style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {u.displayName}
                        </span>
                        {isSelected && <UserCheck size={14} style={{ color: 'var(--neon-emerald)', marginLeft: 'auto' }} />}
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
                <label className="form-label">Avatar Selection</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  {AVATAR_PRESETS.map((presetUrl, idx) => (
                    <img 
                      key={idx}
                      src={presetUrl} 
                      alt={`Preset ${idx}`} 
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        cursor: 'pointer',
                        border: avatar === presetUrl ? '2px solid var(--neon-cyan)' : '2px solid transparent',
                        padding: '2px',
                        background: 'var(--bg-surface)'
                      }}
                      onClick={() => setAvatar(presetUrl)}
                    />
                  ))}
                </div>
                <input 
                  className="form-input" 
                  placeholder="Or enter custom image URL..."
                  value={avatar} 
                  onChange={(e) => setAvatar(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">User Bio</label>
                <textarea 
                  className="form-input" 
                  rows={2}
                  placeholder="Tell the Panda node network about yourself..." 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  style={{ resize: 'vertical' }}
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
                <label className="form-label">Presence Indicator</label>
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
            </>
          )}

          {activeTab === 'ui' && (
            <>
              {/* Theme Preset Selector */}
              <div className="form-group">
                <label className="form-label">Sci-Fi Theme Preset</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {Object.entries(THEME_PRESETS).map(([key, item]) => (
                    <div
                      key={key}
                      style={{
                        background: item.bgSurface,
                        border: theme === key ? `2px solid ${item.neonCyan}` : '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        padding: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      onClick={() => setTheme(key)}
                    >
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{item.name}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.neonCyan }} />
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.neonPurple }} />
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.neonEmerald }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <div className="form-group">
                <label className="form-label">Glassmorphism Backdrop Blur ({blurIntensity}px)</label>
                <input 
                  type="range" 
                  min="0" 
                  max="30" 
                  value={blurIntensity} 
                  onChange={(e) => setBlurIntensity(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: 'var(--neon-cyan)' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Neon Glow Intensity ({glowIntensity}px)</label>
                <input 
                  type="range" 
                  min="0" 
                  max="25" 
                  value={glowIntensity} 
                  onChange={(e) => setGlowIntensity(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: 'var(--neon-purple)' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">UI Font Scale ({fontScale}x)</label>
                <input 
                  type="range" 
                  min="0.85" 
                  max="1.25" 
                  step="0.05"
                  value={fontScale} 
                  onChange={(e) => setFontScale(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--neon-cyan)' }}
                />
              </div>

              {/* Compact Mode Toggle */}
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Compact Chat Density</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Reduce chat padding and message card height for dense monitoring</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={compactMode} 
                  onChange={(e) => setCompactMode(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--neon-cyan)' }}
                />
              </div>
            </>
          )}

          {activeTab === 'audio-video' && (
            <>
              {/* Audio Input Selector */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mic size={14} style={{ color: 'var(--neon-cyan)' }} /> Audio Input Device (Microphone)
                </label>
                <select 
                  className="form-input" 
                  value={selectedAudioInput} 
                  onChange={(e) => setSelectedAudioInput(e.target.value)}
                >
                  <option value="default">Default System Microphone</option>
                  {audioInputDevices.map((device, idx) => (
                    <option key={device.deviceId || idx} value={device.deviceId}>
                      {device.label || `Microphone ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Audio Output Selector */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Volume2 size={14} style={{ color: 'var(--neon-emerald)' }} /> Audio Output Device (Speakers / Headset)
                </label>
                <select 
                  className="form-input" 
                  value={selectedAudioOutput} 
                  onChange={(e) => setSelectedAudioOutput(e.target.value)}
                >
                  <option value="default">Default System Output</option>
                  {audioOutputDevices.map((device, idx) => (
                    <option key={device.deviceId || idx} value={device.deviceId}>
                      {device.label || `Speaker ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Video Input Selector */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Video size={14} style={{ color: 'var(--neon-purple)' }} /> Camera Device
                </label>
                <select 
                  className="form-input" 
                  value={selectedVideoInput} 
                  onChange={(e) => setSelectedVideoInput(e.target.value)}
                >
                  <option value="default">Default System Camera</option>
                  {videoInputDevices.map((device, idx) => (
                    <option key={device.deviceId || idx} value={device.deviceId}>
                      {device.label || `Camera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Camera Preview Test */}
              <div className="form-group" style={{ background: 'var(--bg-space)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>Video Preview Test</span>
                  <button 
                    className={`btn ${isTestCamActive ? 'btn-secondary' : 'btn-primary'}`} 
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                    onClick={toggleTestCam}
                  >
                    {isTestCamActive ? 'Stop Test' : 'Test Camera'}
                  </button>
                </div>
                {isTestCamActive ? (
                  <video 
                    ref={testCamRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    style={{ width: '100%', height: '180px', borderRadius: '6px', background: '#000', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ height: '120px', borderRadius: '6px', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                    Click "Test Camera" to preview camera output
                  </div>
                )}
              </div>

              {/* WebRTC Audio Processing Controls */}
              <div style={{ marginTop: '16px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--neon-cyan)', marginBottom: '12px' }}>
                  WebRTC Audio Signal Processing
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Noise Suppression</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Filters background fan and environment noise</div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={noiseSuppression} 
                      onChange={(e) => setNoiseSuppression(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--neon-cyan)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Echo Cancellation</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Prevents audio feedback loops from speakers</div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={echoCancellation} 
                      onChange={(e) => setEchoCancellation(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--neon-cyan)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Automatic Gain Control</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Dynamically normalizes microphone volume</div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={autoGainControl} 
                      onChange={(e) => setAutoGainControl(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--neon-cyan)' }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'hotkeys' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Global Project Panda keyboard shortcuts:
              </div>

              {[
                { combo: 'Ctrl + K', desc: 'Open Instant Global Search (Channels, DMs, History)' },
                { combo: 'Alt + ↑ / ↓', desc: 'Quick switch channels in active server' },
                { combo: 'Ctrl + Shift + M', desc: 'Global Mute / Unmute microphone toggle' },
                { combo: 'Esc', desc: 'Dismiss active modal or full-screen image lightbox' },
                { combo: 'Enter', desc: 'Send chat message (Shift+Enter for newline)' }
              ].map((hk, i) => (
                <div 
                  key={i} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '10px 14px', 
                    background: 'var(--bg-space)', 
                    borderRadius: '8px', 
                    border: '1px solid var(--glass-border)' 
                  }}
                >
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{hk.desc}</span>
                  <span 
                    style={{ 
                      fontSize: '11px', 
                      fontFamily: 'var(--font-code)', 
                      padding: '4px 8px', 
                      background: 'rgba(0, 242, 254, 0.15)', 
                      border: '1px solid var(--neon-cyan)', 
                      borderRadius: '4px', 
                      color: 'var(--neon-cyan)',
                      fontWeight: '700'
                    }}
                  >
                    {hk.combo}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          {activeTab === 'profile' && (
            <button className="btn btn-primary" onClick={handleSave}>Save Profile</button>
          )}
        </div>
      </div>
    </div>
  );
};
