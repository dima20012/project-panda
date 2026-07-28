# 🐼 Project Panda — Continuous Development & Standalone Server Architecture Plan

> **Goal**: Evolve Project Panda into a TeamSpeak/Discord-style distributed client-server ecosystem. Support both local embedded server mode and dedicated self-hosted server nodes (Linux/Windows VPS, Docker, LAN host) with dynamic client node switching.

---

## 🎯 Architectural Vision: Client & Server Ecosystem

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PROJECT PANDA CLIENT (ELECTRON APP)                  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Server Connection Manager (ServerConnectionModal / Settings)     │  │
│  │ Select Active Node:                                               │  │
│  │  • [Local Node] http://localhost:3001                              │  │
│  │  • [Community Node] https://panda.cyber-guild.net:3001            │  │
│  │  • [LAN Node] http://192.168.1.100:3001                          │  │
│  └──────────────────────────────┬───────────────────────────────────┘  │
└─────────────────────────────────┼──────────────────────────────────────┘
                                  │ Dynamic HTTP API & WebSockets (Socket.io)
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
┌───────────────┐       ┌───────────────────┐     ┌───────────────────┐
│ Local Node    │       │ Dedicated VPS     │     │ LAN Home Server   │
│ (Embedded)    │       │ (Docker/Node.js)  │     │ (Self-Hosted)     │
└───────────────┘       └───────────────────┘     └───────────────────┘
```

---

## 📋 Phased Continuous Roadmap & State Tracker

### 🚀 Phase 1: Dynamic Server Node Connection & Standalone Server (IN PROGRESS)
- [x] **1.1 Dynamic API & Socket Endpoint Configuration**: Refactor `AuthContext`, `SocketContext`, `ServerContext`, and `VoiceContext` to read `serverUrl` dynamically from `localStorage.getItem('panda_server_url')` (default `http://localhost:3001`).
- [x] **1.2 Node Connection Switcher Modal (`ServerConnectionModal.jsx`)**: Add a connection manager modal in Settings / Server bar where users input custom server URLs, test ping latency, and switch active Panda nodes in 1 click.
- [x] **1.3 Standalone Server Build Script (`npm run server:standalone`)**: Package `server/server.cjs` for standalone deployment (Docker / VPS / Windows Service) with CORS origin flexibility and environment variables (`PORT`, `HOST`, `SERVER_NAME`).
- [x] **1.4 Server Ping & Status Endpoint**: `/api/ping` returning server name, active user count, version, and latency.

---

### 🚀 Phase 2: Community Server Profiles & Server Access Keys
- [x] **2.1 Community Server Info Banner & Header**: Render remote server banner, MOTD (Message of the Day), owner info, and ping latency in `ChannelsSidebar.jsx`.
- [x] **2.2 Server Access Password & Invite Token Security**: Support optional server join passwords / tokens for private TeamSpeak-style communities.
- [x] **2.3 Remote File Storage Path Resolver**: Dynamically resolve image/audio/video attachment URLs relative to active server node host (`serverUrl + attachment.url`).

---

### 🚀 Phase 3: WebRTC Signaling Mesh across Remote Nodes
- [x] **3.1 Configurable STUN / TURN Server Settings**: Allow community server admins to configure custom STUN/TURN servers in `server.cjs` for WebRTC NAT traversal across strict firewalls.
- [x] **3.2 Adaptive Peer Connection Protocol**: Handle WebRTC mesh signaling across WAN IPs / remote domains.

---

### 🚀 Phase 4: Extended Continuous Features & Enterprise Improvements

#### 1. 🎙️ Advanced Audio & Voice Mesh (TeamSpeak Power Features)
- [ ] **4.1 3D Spatial Audio (`PannerNode`)**: Web Audio 3D spatial panning based on grid coordinate layout.
- [ ] **4.2 TeamSpeak Whisper & Multi-Channel Broadcast**: Dedicated push-to-talk key to talk to targeted users or broadcast across all voice channels simultaneously.
- [ ] **4.3 Integrated Soundboard Engine**: Local and server-side sound effect triggers for voice channel playback.

#### 2. 🔐 Security & Access Control
- [ ] **4.4 Role-Based Access Control (RBAC)**: Admin, Moderator, Member, Guest roles with granular channel permissions (View, Send, Manage, Kick/Mute).
- [ ] **4.5 Server Join Passwords & Access Tokens**: Require authentication tokens for private community nodes.
- [ ] **4.6 Server Audit Event Logs**: Event trail logging for administrative actions in `data/db.json`.

#### 3. 💬 Rich Media & Messaging
- [ ] **4.7 Emoji Message Reactions**: Interactive emoji picker per message with real-time socket count updates.
- [ ] **4.8 Code Snippet Viewer**: Auto-syntax-highlighting code viewer for uploaded `.js`, `.py`, `.json` code attachments with copy/download buttons.
- [ ] **4.9 Threaded Reply Drawers**: Nested discussion threads per message.

#### 4. 🛠️ Operations & Windows Desktop Integration
- [ ] **4.10 1-Click Server Backup & Restore**: Download/export entire server database (`data/db.json` + `uploads/`) as `.zip` archive.
- [ ] **4.11 System Tray Minimization**: Minimize to Windows Notification Area (System Tray) with background voice listening.

---

## 📌 Turn Progress Checkpoint Log (For AI & Developers)

| Date / Timestamp | Status | Completed Checkpoints | Next Immediate Task |
|---|---|---|---|
| 2026-07-28 12:47 | 🟢 DISCORD FEATURES & OPS COMPLETED | Added Message Pinning & Unpinning (`MessageFeed.jsx` & `server.cjs`), 1-Click Server Backup & Restore JSON Export/Import (`UserSettingsModal.jsx` & `/api/server/backup`), and 11-feature Discord/TeamSpeak roadmap. | Role-Based Access Badges & System Tray options. |
