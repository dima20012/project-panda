# 🏗️ Technical Architecture — Project Panda 🐼

This document details the architectural layout of the native Windows Electron Desktop application, Electron IPC bridge, real-time Socket.io events, WebRTC signaling protocol, hardware device management, layout rendering rules, distributed client-server architecture, design system, theme engine, state persistence, and Web Audio synthesis architecture.

---

## 🌐 Client-Server Distributed Architecture (TeamSpeak Self-Hosted Model)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          PROJECT PANDA DISTRIBUTED MESH                         │
│                                                                                 │
│  ┌───────────────────────────┐                ┌──────────────────────────────┐  │
│  │ Windows Desktop Client A  │                │ Windows Desktop Client B     │  │
│  │ (Electron / React 19)     │                │ (Electron / React 19)        │  │
│  └─────────────┬─────────────┘                └──────────────┬───────────────┘  │
│                │                                             │                  │
│                │ Dynamic API & WebSockets (apiConfig.js)     │                  │
│                ▼                                             ▼                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ Standalone / Embedded Node Server (Express + Socket.io + WebRTC Signaler) │  │
│  │ Host: 0.0.0.0:3001 • Endpoint: /api/ping • Storage: data/db.json          │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📡 Dynamic Node Resolution & Latency Pinging (`apiConfig.js` & `ChannelsSidebar.jsx`)

1. **Dynamic Server URL Resolver (`getServerUrl()`)**: Reads target node URL from `localStorage.getItem('panda_server_url')` (defaulting to `http://localhost:3001`). Strips trailing slashes cleanly.
2. **Node Health & Latency Probe (`pingServerNode(targetUrl)`)**: Hits `/api/ping` via GET request to measure round-trip ping latency (ms) and verify:
   - `serverName`: Configurable node title (`SERVER_NAME`).
   - `motd`: Node welcome message (`SERVER_MOTD`).
   - `version`: Node software version (`1.2.0`).
   - `usersOnline`: Count of active connected Socket.io sockets.
3. **Automatic 15s Background Polling (`ChannelsSidebar.jsx`)**: The sidebar header periodically executes `pingServerNode()` every 15 seconds to display a live health status badge (`🟢 Node Name • 12ms`) indicating node connectivity and round-trip ping times.
4. **Node Connection Manager Modal (`ServerConnectionModal.jsx`)**: Accessible via Globe button in `ServersBar.jsx`. Provides connection testing, ping latency displays, preset switching (Local Embedded vs. LAN Node Host), and seamless client re-initialization.
5. **Standalone Dedicated Server Mode**: Powered by `server/server.cjs` (`npm run server:standalone`), listening on `0.0.0.0:3001` with environment variables (`PORT`, `HOST`, `SERVER_NAME`, `SERVER_MOTD`) for self-hosted VPS/home server deployments.
6. **Continuous Tracker (`CONTINUOUS_DEV_PLAN.md`)**: Tracks master continuous development plan and state checkpoints.

---

## 🎙️ WebRTC Voice/Video, Screen Share & Hardware Routing (`VoiceContext.jsx`)

`VoiceContext.jsx` manages WebRTC mesh connections (`RTCPeerConnection`), audio/video capture, hardware device routing, and native desktop screen sharing:

- **Desktop Screen & Window Sharing (`ScreenShareModal.jsx`)**:
  - Invokes `window.electronAPI.getDesktopSources()` via IPC to fetch thumbnails and handles of open desktop windows and monitors.
  - Passes target `sourceId` into `startScreenShareWithSourceId(sourceId)` using Chrome desktop constraints (`chromeMediaSource: 'desktop'`, `chromeMediaSourceId: sourceId`).
- **Hardware Device Enumeration & Routing**:
  - Uses `navigator.mediaDevices.enumerateDevices()` to scan for `audioinput`, `audiooutput`, and `videoinput` devices.
  - Microphone saved in `panda_audio_input`, Speakers in `panda_audio_output`, Camera in `panda_video_input`.
- **WebRTC Signal Processing Constraints**:
  - `noiseSuppression` toggle (`panda_noise_suppression`), `echoCancellation` toggle (`panda_echo_cancellation`), and `autoGainControl` toggle (`panda_auto_gain`).
- **Sticky Voice Control Bar & Grid Layout (`VoiceGrid.jsx` & `index.css`)**:
  - Voice controls bar set to `flex-shrink: 0` to prevent clipping under large video tiles.
  - Video tiles enforced at `16/9` aspect ratio with a `380px` max height.
  - `voice-video-grid` container set to `overflow-y: auto` for seamless scrolling.
- **Voice Connection & Navigation State Reset (`App.jsx`)**:
  - `isVoiceActiveChannel` calculated dynamically as `Boolean(activeVoiceChannelId && activeChannel?.id === activeVoiceChannelId)`.
  - Disconnecting from voice immediately reverts the active main stage back to the channel text chat view.

---

## 🖥️ Electron Main & Preload Process Architecture

1. **Child Process Server Spawn**: `electron/main.cjs` automatically launches `server/server.cjs` on `localhost:3001` when the desktop app opens, and terminates it cleanly on app exit.
2. **Frameless Windows Shell**: Built with `frame: false` to render custom acrylic titlebar with Project Panda status badge (`🟢 PANDA NODE ACTIVE`).
3. **Safe Server Load Sequence (`checkServerAvailable`)**:
   - Uses non-destructive HTTP pre-checking (`checkServerAvailable(url)` with a 500ms timeout) before loading target URLs.
   - **Priority 1**: Checks `http://localhost:5173` (Vite dev server for development).
   - **Priority 2**: Checks built `dist/index.html` (bundled production build).
   - **Priority 3**: Checks `http://localhost:3001` (Express backend fallback server).
   - Completely avoids `ERR_CONNECTION_REFUSED` triggers and infinite `did-fail-load` reload loops.
4. **IPC Bridge API (`electron/preload.cjs`)**:
   - `window.electronAPI.minimizeWindow()`: Minimizes window to taskbar via `window-minimize`.
   - `window.electronAPI.maximizeWindow()`: Toggles window maximization via `window-maximize`.
   - `window.electronAPI.closeWindow()`: Exits desktop app cleanly via `window-close`.
   - `window.electronAPI.flashWindow()`: Invokes native Windows taskbar flashing (`mainWindow.flashFrame(true)`) when unfocused via `flash-window`.
   - `window.electronAPI.showNotification(title, body)`: Triggers native Windows desktop notifications via Electron `Notification` API (`show-notification`).
   - `window.electronAPI.getDesktopSources()`: Captures window and screen sources for WebRTC screen sharing.

---

## ⚡ Vite Dev Server Watcher Configuration (`vite.config.js`)

To prevent unwanted full-page reloads and state resets when writing to the local persistent database (`data/db.json`) or uploading media attachments, Vite's watcher ignores runtime mutation directories:

```js
server: {
  watch: {
    ignored: ['**/data/**', '**/uploads/**', '**/release/**']
  }
}
```

---

## 🔄 Server & Navigation State Flow (`ServerContext.jsx`)

`ServerContext.jsx` manages active server and channel selection with automatic local storage persistence across app restarts:

- **Active Server Persistence**: Saved to `localStorage.getItem('panda_active_server_id')`.
- **Active Channel Persistence**: Saved to `localStorage.getItem('panda_active_channel_id')`.
- On startup, `fetchServers()` automatically restores the user's last selected server and channel.

---

## 🎨 Theme & Glassmorphism System Architecture (`ThemeContext.jsx`)

The dynamic theme engine manages real-time CSS variable bindings and stores user preferences in browser `localStorage`:

- **Theme Presets**:
  - `obsidian`: Obsidian Neon (Default space palette `#090c15`, Neon Cyan `#00f2fe`, Purple `#7f00ff`, Emerald `#00ff87`).
  - `cyberpunk`: Cyberpunk Matrix (Matrix green accent `#00ffaa`, cyan `#00e5ff`, neon lime `#39ff14`).
  - `violet`: Electric Violet (Deep synthwave violet `#12071f`, pink `#d946ef`, purple `#a855f7`).
  - `solar`: Solar Flare (Warm solar amber `#180a05`, gold `#ffb800`, orange `#ff5500`).
- **Dynamic CSS Custom Properties**:
  - `--bg-space`, `--bg-surface`, `--bg-card`, `--neon-cyan`, `--neon-purple`, `--neon-emerald`.
  - `--glass-blur-val`: Controlled via 0-30px slider (saved in `panda_blur`).
  - `--glow-val`: Controlled via 0-25px slider (saved in `panda_glow`).
  - `--font-scale-val`: Dynamic UI text scaling from 0.85x to 1.25x (saved in `panda_font_scale`).
  - `body.compact-mode`: Toggled via Compact Chat Density switch (saved in `panda_compact`).

---

## ⌨️ Global Keyboard Shortcut System (`useKeyboardShortcuts.js`)

Centralized custom React hook capturing `keydown` window listeners:
- `Ctrl + K` / `Cmd + K`: Triggers global instant search modal across channels and history.
- `Alt + ArrowUp` / `Alt + ArrowDown`: Cycles active channel navigation forward and backward.
- `Ctrl + Shift + M`: Toggles global voice microphone mute state in WebRTC voice mesh.
- `Esc`: Dismisses active modals, user settings, or image lightbox view.

---

## 🔊 Zero-Dependency Web Audio Synthesizer (`utils/soundEffects.js`)

Real-time audio feedback generated dynamically using browser native Web Audio API (`AudioContext`), eliminating external audio file assets:
- **`playJoinVoiceSound()`**: Dual-oscillator sine + triangle pitch-ramp sweep (440Hz -> 880Hz / 554Hz -> 1108Hz).
- **`playMuteSound()`**: Falling pitch sine wave sweep (600Hz -> 300Hz).
- **`playNotificationSound()`**: Rapid ascending chime (783.99Hz -> 1046.50Hz).

---

## 💬 Rich Chat & Media Pipeline

- **Drag & Drop Attachment Overlay (`ChatInput.jsx`)**: HTML5 Drag & Drop event handlers (`onDragOver`, `onDragLeave`, `onDrop`) triggering visual backdrop blur overlay and dispatching dropped files directly to `/api/upload`.
- **Text Formatting Quick Toolbar (`ChatInput.jsx`)**: Quick action bar providing single-click inline Markdown insertion for **Bold** (`**`), *Italic* (`*`), `Inline Code` (`` ` ``), and ||Spoiler|| (`||`).
- **Pinned Messages Drawer (`PinnedModal.jsx` & `ChatHeader.jsx`)**: Dedicated channel drawer modal triggered from `ChatHeader.jsx` that filters channel messages (`messages.filter(m => m.pinned)`) and renders pinned message cards with Markdown support.
- **Spoiler Text Filter (`MarkdownText.jsx`)**: Transforms `||text||` markup into blurred click-to-reveal elements (`filter: blur(5px)` toggled to clear on click).
- **Inline Media Players (`MessageFeed.jsx`)**: Auto-detects attachment MIME types/extensions (`mp3`, `wav`, `ogg`, `mp4`, `webm`) and embeds HTML5 `<audio controls>` or `<video controls>`.
- **Chat History Markdown Exporter (`ChatHeader.jsx`)**: Serializes channel message stream into formatted `.md` documents with client-side blob download (`panda_chat_{channel}_{timestamp}.md`).
