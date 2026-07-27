import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEME_PRESETS = {
  obsidian: {
    name: 'Obsidian Neon',
    bgSpace: '#090c15',
    bgSurface: '#0f1422',
    bgCard: 'rgba(21, 28, 44, 0.75)',
    neonCyan: '#00f2fe',
    neonPurple: '#7f00ff',
    neonEmerald: '#00ff87',
  },
  cyberpunk: {
    name: 'Cyberpunk Matrix',
    bgSpace: '#05130b',
    bgSurface: '#0a1f13',
    bgCard: 'rgba(12, 36, 22, 0.8)',
    neonCyan: '#00ffaa',
    neonPurple: '#00e5ff',
    neonEmerald: '#39ff14',
  },
  violet: {
    name: 'Electric Violet',
    bgSpace: '#12071f',
    bgSurface: '#1c0c30',
    bgCard: 'rgba(38, 16, 64, 0.8)',
    neonCyan: '#d946ef',
    neonPurple: '#a855f7',
    neonEmerald: '#ec4899',
  },
  solar: {
    name: 'Solar Flare',
    bgSpace: '#180a05',
    bgSurface: '#241008',
    bgCard: 'rgba(48, 20, 10, 0.8)',
    neonCyan: '#ffb800',
    neonPurple: '#ff5500',
    neonEmerald: '#ff2a5f',
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('panda_theme') || 'obsidian');
  const [blurIntensity, setBlurIntensity] = useState(() => parseInt(localStorage.getItem('panda_blur') || '12', 10));
  const [glowIntensity, setGlowIntensity] = useState(() => parseInt(localStorage.getItem('panda_glow') || '10', 10));
  const [fontScale, setFontScale] = useState(() => parseFloat(localStorage.getItem('panda_font_scale') || '1.0'));
  const [compactMode, setCompactMode] = useState(() => localStorage.getItem('panda_compact') === 'true');

  useEffect(() => {
    localStorage.setItem('panda_theme', theme);
    const preset = THEME_PRESETS[theme] || THEME_PRESETS.obsidian;

    document.documentElement.style.setProperty('--bg-space', preset.bgSpace);
    document.documentElement.style.setProperty('--bg-surface', preset.bgSurface);
    document.documentElement.style.setProperty('--bg-card', preset.bgCard);
    document.documentElement.style.setProperty('--neon-cyan', preset.neonCyan);
    document.documentElement.style.setProperty('--neon-purple', preset.neonPurple);
    document.documentElement.style.setProperty('--neon-emerald', preset.neonEmerald);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('panda_blur', blurIntensity);
    document.documentElement.style.setProperty('--glass-blur-val', `${blurIntensity}px`);
  }, [blurIntensity]);

  useEffect(() => {
    localStorage.setItem('panda_glow', glowIntensity);
    document.documentElement.style.setProperty('--glow-val', `${glowIntensity}px`);
  }, [glowIntensity]);

  useEffect(() => {
    localStorage.setItem('panda_font_scale', fontScale);
    document.documentElement.style.setProperty('--font-scale-val', `${fontScale}`);
  }, [fontScale]);

  useEffect(() => {
    localStorage.setItem('panda_compact', compactMode);
    if (compactMode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
  }, [compactMode]);

  return (
    <ThemeContext.Provider value={{
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
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
