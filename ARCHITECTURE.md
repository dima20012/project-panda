# 🏗️ Technical Architecture — Aether Windows Node

This document details the architectural layout of the native Windows Electron Desktop application, Electron IPC bridge, real-time Socket.io events, WebRTC signaling protocol, and Aether design system.

---

## 📐 Desktop Windows Application Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AETHER WINDOWS ELECTRON APPLICATION                  │
│                                                                         │
│  ┌─────────────────────────┐           ┌─────────────────────────────┐  │
│  │ Electron Main Process   │           │ Electron Renderer Process   │  │
│  │ (electron/main.cjs)     │           │ (React + Vite + Design HUD) │  │
│  └────────────┬────────────┘           └──────────────┬──────────────┘  │
│               │ Spawns Child                          │ IPC Bridge      │
│               ▼                                       ▼                 │
│  ┌─────────────────────────┐           ┌─────────────────────────────┐  │
│  │ Local Node Express      │◄──────────┤ preload.cjs Window Controls │  │
│  │ (server/server.cjs)     │ HTTP/WS   │ (Minimize, Maximize, Close) │  │
│  └─────────────────────────┘           └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🖥️ Electron Main & Preload Process

1. **Child Process Server Spawn**: `electron/main.cjs` automatically launches `server/server.cjs` on `localhost:3001` when the desktop app opens, and terminates it cleanly on app exit.
2. **Frameless Windows Shell**: Built with `frame: false` to render custom acrylic titlebar with node latency pulse badge.
3. **IPC Bridge (`electron/preload.cjs`)**:
   - `window.electronAPI.minimizeWindow()`
   - `window.electronAPI.maximizeWindow()`
   - `window.electronAPI.closeWindow()`
   - `window.electronAPI.getDesktopSources()` for screen sharing.

---

## 🎨 Aether Holographic Design Tokens

- **Space Obsidian Background**: `#06080D`
- **Surface Matrix**: `#0D111A`
- **Neon Cyan**: `#00F2FE` (Glow: `rgba(0, 242, 254, 0.4)`)
- **Electric Violet**: `#7F00FF` (Glow: `rgba(127, 0, 255, 0.4)`)
- **Emerald Pulse**: `#00FF87`
- **Glassmorphism Layer**: `backdrop-filter: blur(24px)`, `border: 1px solid rgba(255, 255, 255, 0.09)`
