# 🏗️ Technical Architecture — Project Panda 🐼

This document details the architectural layout of the native Windows Electron Desktop application, Electron IPC bridge, real-time Socket.io events, WebRTC signaling protocol, and Project Panda design system.

---

## 📐 Desktop Windows Application Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PROJECT PANDA WINDOWS ELECTRON APP                   │
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
2. **Frameless Windows Shell**: Built with `frame: false` to render custom acrylic titlebar with Project Panda status badge (`🟢 PANDA NODE ACTIVE • 0.8ms LAN`).
3. **IPC Bridge (`electron/preload.cjs`)**:
   - `window.electronAPI.minimizeWindow()`
   - `window.electronAPI.maximizeWindow()`
   - `window.electronAPI.closeWindow()`
   - `window.electronAPI.getDesktopSources()` for screen sharing.
