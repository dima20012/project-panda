# 📋 Project Information — Project Panda 🐼

## 🎯 Overview
**Project Panda** is a native Windows desktop communication app with a custom Holographic Sci-Fi Glassmorphism user interface. Built with Electron, React 19, Express, Socket.io, and WebRTC, it provides real-time chat, voice, video, screen sharing, sci-fi theme customization, hardware device selection, self-hosted node management, state persistence, and local data storage.

- **GitHub Repository**: [https://github.com/dima20012/project-panda](https://github.com/dima20012/project-panda)
- **Continuous Development Plan**: [CONTINUOUS_DEV_PLAN.md](file:///C:/ProjectDC/CONTINUOUS_DEV_PLAN.md)

---

## ✨ Features & Capabilities

### 🌐 TeamSpeak-Style Self-Hosted Distributed Architecture (`apiConfig.js`)
- **Dynamic Node URL Resolution (`getServerUrl`)**: Clients dynamically target any local or remote server node stored in `localStorage` (`panda_server_url`).
- **Server Health & Latency Pinging (`/api/ping`)**: Measures real-time connection latency in milliseconds, node version, custom server name (`SERVER_NAME`), MOTD (`SERVER_MOTD`), and connected socket count.
- **Live Node Status Badge (`ChannelsSidebar.jsx`)**: Sidebar header displays a real-time status badge (`🟢 Node Name • 12ms`) updated continuously via a 15-second background ping timer.
- **Node Connection Manager Modal (`ServerConnectionModal.jsx`)**: Accessible via the Globe button on the server sidebar for quick testing and server node switching.
- **Standalone Dedicated Server Mode (`server/server.cjs`)**: Run standalone community nodes on LAN or cloud VPS instances via `npm run server:standalone` with configurable environment variables.

### 💬 Rich Chat & Media Enhancements
- **Drag & Drop Attachment Overlay (`ChatInput.jsx`)**: Drop files anywhere onto the chat input zone to attach images or media files instantly with a visual cyan glass overlay.
- **Text Formatting Quick Toolbar (`ChatInput.jsx`)**: One-click quick toolbar for inserting Bold (`**text**`), Italic (`*text*`), Code (`` `text` ``), and Spoiler (`||text||`) Markdown formatting.
- **Pinned Messages Drawer (`PinnedModal.jsx`)**: View all pinned channel announcements in a dedicated channel modal accessible from the chat header.
- **Spoiler Blur Masks (`MarkdownText.jsx`)**: Wrap text in `||spoiler||` to render blurred text that reveals on click.
- **Inline Audio & Video Players (`MessageFeed.jsx`)**: Native HTML5 `<audio>` and `<video>` players for mp3, wav, ogg, mp4, and webm file attachments.
- **One-Click Chat Export (`ChatHeader.jsx`)**: Export entire channel conversation history into formatted `.md` (Markdown) files with a single click.
- **Code Block Copy Button**: Quick code copy button with checkmark confirmation animation.

### 🎥 Native Desktop Screen Sharing & Voice Grid HUD
- **Electron Screen & Window Picker Modal (`ScreenShareModal.jsx`)**: Native window and screen source selector powered by Electron `getDesktopSources` IPC bridge with real-time thumbnail previews.
- **Sticky Voice Control Bar**: Bottom voice action HUD (`flex-shrink: 0`) remains permanently visible and accessible even with active multi-user camera tiles or high-resolution screen streams.
- **Instant Disconnect Reset**: Disconnecting from a voice room immediately returns the main stage UI back to the text channel view.

### 🎙️ Audio & Video Hardware Management (`VoiceContext.jsx` & `UserSettingsModal.jsx`)
- **Microphone & Speaker Selection**: Dedicated dropdown selectors for input microphones and output speakers/headsets.
- **Camera Device Routing**: Dropdown selection for connected webcam/video capture devices.
- **Live Camera Test Preview Box**: Real-time video stream test box within settings for checking camera angle and quality prior to joining voice rooms.
- **WebRTC Audio Signal Processing Toggles**:
  - **Noise Suppression**: Filter background ambient noise and keyboard clicks.
  - **Echo Cancellation**: Prevent audio feedback loops from open desktop speakers.
  - **Automatic Gain Control**: Normalize microphone gain dynamically.

### 👤 User Profile & Account Settings (`UserSettingsModal.jsx`)
- **4 Tabbed Settings Sections**:
  - **Profile & Identity**: Custom Display Name, Bio, Custom Status message, and Presence Indicator.
  - **UI & Aesthetics**: Sci-Fi theme presets, sliders, and compact chat mode toggle.
  - **Audio & Video**: Input/output device selectors, live camera test preview, and WebRTC audio processing toggles.
  - **Hotkeys**: Interactive keyboard shortcut cheat sheet.
- **Sci-Fi Avatar Presets**: 6 built-in neon sci-fi avatar options plus custom avatar URL input.
- **Presence Indicators**: 🟢 Online, 🟡 Idle, 🔴 Do Not Disturb, ⚪ Invisible.
- **Multi-User Profile Switcher**: Built-in developer switcher for multi-account testing.

### 🎨 Holographic Themes & Customization Settings (`ThemeContext.jsx`)
- **4 Holographic Theme Presets**:
  - **Obsidian Neon**: Classic deep space obsidian with neon cyan and purple accents.
  - **Cyberpunk Matrix**: Matrix terminal green and electric cyan glow.
  - **Electric Violet**: Deep synthwave purple and vivid magenta highlights.
  - **Solar Flare**: Solar orange, amber gold, and crimson glow.
- **Glassmorphism Backdrop Blur Slider**: Adjust window blur intensity from `0px` to `30px`.
- **Neon Glow Intensity Slider**: Customize ambient glow radius from `0px` to `25px`.
- **UI Font Scaling**: Dynamic scale slider (`0.85x` to `1.25x`) adjusting interface text size.
- **Compact Chat Density Mode**: Toggleable compact chat mode reducing padding and message card height for high-density monitoring.

### 🛡️ Non-Destructive App Load Sequence (`electron/main.cjs`)
- **HTTP Pre-Checking (`checkServerAvailable`)**: Electron performs HTTP GET pre-checks before opening window URLs. If Vite dev server (`http://localhost:5173`) is running, it connects automatically; if inactive, it directly opens the production `dist/index.html` build without throwing `ERR_CONNECTION_REFUSED` errors or infinite loop retries.

### ⚡ Hot Reload Stability & Watcher Rules (`vite.config.js`)
- Watcher ignores runtime storage paths (`data/**`, `uploads/**`, `release/**`), preventing unexpected dev server reloads during database operations or file uploads.

### 📍 Persistent Server & Channel State (`ServerContext.jsx`)
- Seamlessly remembers active server (`panda_active_server_id`) and active channel (`panda_active_channel_id`) across app reloads and restarts.

### 💻 Native Windows Desktop Integration (`electron/main.cjs` & `preload.cjs`)
- **Frameless Acrylic Shell**: Custom titlebar with minimize, maximize/restore, close buttons and node status indicator.
- **Taskbar Window Flashing**: Triggers Windows taskbar flashing (`flashFrame`) when new messages arrive while the window is unfocused.
- **Native Windows Toast Notifications**: Desktop notification popups via Electron `Notification` API.

### ⌨️ Global Keyboard Shortcuts (`useKeyboardShortcuts.js`)
- `Ctrl + K`: Open Instant Global Search across channels, DMs, and message history.
- `Alt + Up / Down`: Instantly cycle through server channels.
- `Ctrl + Shift + M`: Global voice microphone mute/unmute toggle.
- `Esc`: Instantly close active modals, user settings, or image lightbox view.

### 🔊 Web Audio Synthesizer (`utils/soundEffects.js`)
- Zero-dependency synthetic Web Audio API sound generator providing immediate audio feedback for voice join, microphone mute, and new messages.

---

## 💾 Local Storage Persistence Schema

Project Panda persists user theme, navigation, profile, server node, and audio/video device preferences in browser `localStorage`:

| Key | Description | Default Value |
| --- | --- | --- |
| `panda_server_url` | Currently active self-hosted server node URL | `'http://localhost:3001'` |
| `panda_theme` | Selected holographic color theme preset | `'obsidian'` |
| `panda_blur` | Glassmorphism backdrop blur in pixels | `12` |
| `panda_glow` | Neon glow shadow radius in pixels | `10` |
| `panda_font_scale` | Dynamic UI font scale multiplier | `1.0` |
| `panda_compact` | Compact chat density state boolean | `'false'` |
| `panda_active_server_id` | Last active server ID | First available server |
| `panda_active_channel_id` | Last active channel ID | First available channel |
| `panda_audio_input` | Selected microphone device ID | `'default'` |
| `panda_audio_output` | Selected speaker/output device ID | `'default'` |
| `panda_video_input` | Selected camera device ID | `'default'` |
| `panda_noise_suppression` | WebRTC noise suppression toggle | `true` |
| `panda_echo_cancellation` | WebRTC echo cancellation toggle | `true` |
| `panda_auto_gain` | WebRTC automatic gain control toggle | `true` |
| `panda_user` | Currently active user profile object | Default User Object |

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
- **Audio Synthesizer**: Web Audio API Sound Generator (`soundEffects.js`)
- **File Upload Handler**: Multer
- **Database**: Local JSON File Storage (`data/db.json`)
- **Master Continuous Plan**: [CONTINUOUS_DEV_PLAN.md](file:///C:/ProjectDC/CONTINUOUS_DEV_PLAN.md)
