# 📋 Project Information — Aether Windows Node

## 🎯 Overview
**Aether Node** is a native Windows desktop communication app with a custom Holographic Sci-Fi Glassmorphism user interface. Built with Electron, React 19, Express, Socket.io, and WebRTC, it provides real-time chat, voice, video, screen sharing, and local data persistence.

---

## 🛠️ Technology Stack

- **Desktop Framework**: Electron (`electron`)
- **Frontend Framework**: React 19 + Vite 8
- **UI Aesthetics**: Custom Aether Holographic Glassmorphism CSS system (Obsidian `#06080D`, Neon Cyan `#00F2FE`, Electric Violet `#7F00FF`, Emerald `#00FF87`)
- **Icons**: Lucide React (`lucide-react`)
- **Backend Framework**: Node.js + Express
- **Real-Time WebSockets**: Socket.io 4.8
- **Audio/Video Signaling**: Native WebRTC peer connections + screen capture
- **Audio Synthesizer**: Web Audio API Sound Generator
- **File Upload Handler**: Multer
- **Database**: Local JSON File Storage (`data/db.json`)

---

## 📂 File Directory Map

```
C:\ProjectDC\
├── electron/
│   ├── main.cjs                # Electron Main process & child backend server spawn
│   └── preload.cjs             # Windows Native IPC bridge (window controls, desktop capture)
├── data/                       # Local persistent database
│   └── db.json
├── uploads/                    # Local storage directory for user attachments
├── server/
│   ├── server.cjs              # Express + Socket.io Server & WebRTC signaling
│   └── storage.cjs             # JSON Database manager & initial seed data
├── src/
│   ├── components/
│   │   ├── win/                # Windows Titlebar & custom frameless controls
│   │   ├── channels/           # Channel list sidebar & audio control bar
│   │   ├── chat/               # Message feed, markdown parser, input box, header
│   │   ├── dms/                # Friends list & direct messages
│   │   ├── members/            # Right sidebar member list & profile popovers
│   │   ├── sidebar/            # Servers bar navigation
│   │   └── voice/              # WebRTC voice & video grid and stage controls
│   ├── context/
│   │   ├── AuthContext.jsx     # User identity & identity switcher
│   │   ├── ServerContext.jsx   # Server, channel & messaging state
│   │   ├── SocketContext.jsx   # Socket.io connection state
│   │   └── VoiceContext.jsx    # WebRTC peer connection manager & media tracks
│   ├── utils/
│   │   └── soundEffects.js     # Web Audio API sound effect synthesizer
│   ├── App.jsx                 # Main application layout with Windows Titlebar
│   ├── index.css               # Aether Futuristic Glassmorphism Design System
│   └── main.jsx                # Entry point
├── index.html                  # HTML entry point
├── package.json                # Project dependencies & Electron scripts
├── README.md                   # Quickstart & Windows app launcher guide
├── ARCHITECTURE.md             # Desktop Architecture & IPC spec
└── PROJECT_INFO.md             # Project information & stack details
```
