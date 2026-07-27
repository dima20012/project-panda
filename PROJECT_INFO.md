# 📋 Project Information — Project Panda 🐼

## 🎯 Overview
**Project Panda** is a native Windows desktop communication app with a custom Holographic Sci-Fi Glassmorphism user interface. Built with Electron, React 19, Express, Socket.io, and WebRTC, it provides real-time chat, voice, video, screen sharing, and local data persistence.

- **GitHub Repository**: [https://github.com/dima20012/project-panda](https://github.com/dima20012/project-panda)

---

## 🛠️ Windows Installer & Uninstaller Specifications

The Windows setup installer (`Project Panda Setup.exe`) is powered by NSIS:

- **Installer File**: `Project Panda Setup.exe` (103 MB)
- **Installer Features**:
  - Custom installation directory picker (`allowToChangeInstallationDirectory: true`).
  - Automatic Desktop shortcut creation.
  - Automatic Start Menu shortcut creation.
- **Uninstaller Features**:
  - Automatically registers **Project Panda** in Windows **Settings ➔ Apps ➔ Installed Apps** (Add or Remove Programs).
  - Generates `Uninstall Project Panda.exe` inside the installation folder.
  - Removes desktop shortcuts, registry entries, and program files cleanly on uninstall.

---

## 🛠️ Technology Stack

- **Desktop Framework**: Electron (`electron`)
- **Installer Generator**: NSIS via `electron-builder`
- **Frontend Framework**: React 19 + Vite 8
- **UI Aesthetics**: Project Panda Holographic Glassmorphism CSS system (Obsidian `#06080D`, Neon Cyan `#00F2FE`, Electric Violet `#7F00FF`, Emerald `#00FF87`)
- **Icons**: Lucide React (`lucide-react`)
- **Backend Framework**: Node.js + Express
- **Real-Time WebSockets**: Socket.io 4.8
- **Audio/Video Signaling**: Native WebRTC peer connections + screen capture
- **Audio Synthesizer**: Web Audio API Sound Generator
- **File Upload Handler**: Multer
- **Database**: Local JSON File Storage (`data/db.json`)
