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

### 🚀 Phase 4: Extended Continuous Features (Future Phases)
- [ ] **4.1 TeamSpeak-style Whisper / Channel Broadcast**: Talk to specific users or broadcast across all channels simultaneously.
- [ ] **4.2 Advanced Role-Based Access Control (RBAC)**: Admin, Moderator, Member, Guest permissions per server node.
- [ ] **4.3 Automated Backup & Database Export**: One-click server data backup (`data/db.json` + `uploads/`) from server settings.

---

## 📌 Turn Progress Checkpoint Log (For AI & Developers)

| Date / Timestamp | Status | Completed Checkpoints | Next Immediate Task |
|---|---|---|---|
| 2026-07-28 12:42 | 🟢 PHASE 2.1 COMPLETED | Added live Node Health & Latency status badge (`🟢 Node Name • 12ms`) to `ChannelsSidebar.jsx` with automatic 15s background pinging. | Phase 3: WebRTC Audio Analyser Speaking Indicators. |
