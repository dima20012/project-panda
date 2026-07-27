# 🐼 Master Feature Development Plan — Project Panda

> **Design Philosophy (Ponytail Full)**: Maximize UX value while maintaining zero unneeded external dependencies. Leverage native Web APIs, Electron capabilities, CSS custom variables, and existing Express/Socket.io infrastructure.

---

## 🎯 Complete Master Feature Matrix (15 Features)

| # | Category | Feature Name | Description | Ponytail Score | Dependencies | Target Component / Area |
|---|---|---|---|---|---|---|
| 1 | **OS & Desktop** | **Native Windows Notifications & Taskbar Flash** | Taskbar flashing on direct messages/mentions + OS desktop toast alerts | 🟢 **10/10 (Pure Native)** | `0` (Browser/Electron API) | `electron/main.cjs`, `App.jsx` |
| 2 | **OS & Desktop** | **Global Keyboard Navigation & Voice Hotkeys** | `Alt+↑/↓` channel switching, `Ctrl+Shift+M` global voice mute, `Esc` modal dismiss | 🟢 **10/10 (Native Listeners)** | `0` (Native `keydown` Hooks) | `src/hooks/useKeyboardShortcuts.js` |
| 3 | **Chat & Media** | **Quick Inline Emoji Reactions** | Hover action bar with one-click Unicode reactions (`👍`, `❤️`, `🔥`, `😂`, `🚀`, `🎉`) | 🟢 **9/10 (Lean)** | `0` (Native Unicode + DB) | `server/storage.cjs`, `MessageItem.jsx` |
| 4 | **Chat & Media** | **Drag & Drop Uploads + Native Media Players** | Drag files onto chat input + HTML5 `<audio>` & `<video>` inline players | 🟢 **9/10 (Native HTML5)** | `0` (Native Web APIs) | `ChatArea.jsx`, `Attachment.jsx` |
| 5 | **Chat & Media** | **Spoiler Tags & Rich Text Format Bar** | Clickable `||spoiler text||` blur mask + floating bold/italic/code format action bar | 🟢 **9/10 (CSS Masking)** | `0` (Pure CSS + Regex) | `MessageInput.jsx`, `MessageItem.jsx` |
| 6 | **Chat & Media** | **Channel Pinned Messages & Header Topics** | Pin key messages to channel header + editable channel topic banner | 🟡 **8/10 (Lean UI)** | `0` (Socket.io + JSON DB) | `ChannelHeader.jsx`, `PinnedModal.jsx` |
| 7 | **Voice & WebRTC** | **WebRTC Audio/Video Device Selector** | Dropdown in settings/HUD to select microphone & camera input devices | 🟢 **9/10 (Native Web API)** | `0` (WebRTC API) | `VoiceHUD.jsx`, `VoiceSettingsModal.jsx` |
| 8 | **Voice & WebRTC** | **Voice Activity Detection (VAD) Visualizer HUD** | Animated glowing ring around active speakers using Web Audio API frequency analysis | 🟢 **9/10 (Web Audio)** | `0` (Web Audio `AnalyserNode`) | `VoiceGrid.jsx`, `AvatarRing.jsx` |
| 9 | **Voice & WebRTC** | **WebRTC Noise & Echo Suppression Toggles** | Toggle native WebRTC `noiseSuppression`, `echoCancellation`, and `autoGainControl` | 🟢 **10/10 (Native Constraints)** | `0` (WebRTC API) | `VoiceSettingsModal.jsx` |
| 10 | **Customization** | **UI Holographic Theme & Styling Settings** | Theme presets (*Cyberpunk*, *Obsidian*, *Neon Violet*, *Emerald*, *Solar Flare*) + Blur & Glow sliders | 🟢 **10/10 (CSS Variables)** | `0` (CSS Custom Properties) | `src/index.css`, `UISettingsModal.jsx` |
| 11 | **Customization** | **Compact Chat Density & Font Scaling** | Toggle between "Modern Holographic" and "High-Density Compact" chat layout + font size | 🟢 **10/10 (CSS Utility)** | `0` (Pure CSS Utility) | `src/context/ThemeContext.jsx` |
| 12 | **Profile** | **User Profile Customization & Avatar Picker** | Custom avatar image/preset picker, banner gradient background, user bio, and profile card | 🟢 **9/10 (Lean Storage)** | `0` (Multer / Base64 + DB) | `ProfileModal.jsx`, `server/storage.cjs` |
| 13 | **Profile** | **Custom Status Message & Presence Selector** | Custom text status ("In a call 🎧") + status mode (`Online`, `Idle`, `DND`, `Invisible`) | 🟢 **9/10 (Lean State)** | `0` (Socket.io + JSON DB) | `Sidebar.jsx`, `UserCard.jsx` |
| 14 | **Archiving** | **Chat History Export & Backup (Markdown / JSON)** | One-click export of channel or direct message history to `.md` or `.json` file downloads | 🟢 **10/10 (Native Blob)** | `0` (Browser Blob API) | `ChannelHeader.jsx`, `ExportUtils.js` |
| 15 | **Audio & SFX** | **Synthesized Sci-Fi UI Sound Effects** | Synthesized UI audio feedback (join voice room, mute/unmute, user online chime) | 🟢 **9/10 (Zero Assets)** | `0` (Web Audio Synthesizer) | `src/utils/soundEffects.js` |

---

## 🎨 Extended Specifications for Customization & Profile Features

### 🎨 10. UI Holographic Theme & Styling Settings
- **Goal**: Allow full personalization of Project Panda's sci-fi aesthetic without bloated CSS frameworks.
- **Implementation**:
  - CSS Custom Variables (`:root` tokens): `--bg-primary`, `--accent-cyan`, `--accent-violet`, `--glass-blur`, `--glow-spread`.
  - Preset Themes:
    - 🌌 **Obsidian Neon** (Default)
    - ⚡ **Cyberpunk Matrix** (Neon Green / Obsidian)
    - 💜 **Electric Violet** (Deep Purple / Neon Pink)
    - ☀️ **Solar Flare** (Gold / Amber / Dark Red)
  - Interactive Sliders: Glassmorphic Backdrop Blur (`4px` – `24px`), Glow Intensity (`0px` – `15px`), UI Font Scale (`12px` – `18px`).
  - Saved in `localStorage` under key `panda_ui_theme`.
- **Ponytail Rationale**: 100% standard CSS custom properties. Zero extra CSS preprocessors or UI libraries.

### 👤 12. User Profile Customization & Avatar Picker
- **Goal**: Full user self-expression with custom profiles and hover cards.
- **Implementation**:
  - Avatar: Choose from 12 futuristic neon sci-fi avatar presets or upload custom image file (processed via existing Multer upload handler).
  - Profile Banner: Select gradient preset or solid color accent.
  - Bio Field: Multi-line text snippet (up to 200 chars).
  - User Hover Card: Hovering over any username in chat displays their full profile modal card.
- **Ponytail Rationale**: Uses existing `uploads/` directory and `db.json` user record schema.

---

## 🗓️ Complete Phased Roadmap

```
├── 🚀 Phase 1: Customization & Personalization (UI & Profile)
│   ├── Feature 10: UI Holographic Theme & Styling Settings (Presets + Blur/Glow Sliders)
│   ├── Feature 11: Compact Chat Density & Font Scaling
│   ├── Feature 12: User Profile Customization & Avatar Picker (Bio, Banner, Avatars)
│   └── Feature 13: Custom Status Message & Presence Selector (Online/Idle/DND/Invisible)
│
├── 🚀 Phase 2: OS Integration & Navigation
│   ├── Feature 1: Windows Taskbar Flashing & Desktop Notifications
│   └── Feature 2: Global Keyboard Shortcuts & Voice Hotkeys
│
├── 🚀 Phase 3: Rich Chat & Media Experience
│   ├── Feature 3: Quick Inline Emoji Reactions
│   ├── Feature 4: Drag & Drop Uploads + Native Audio/Video Players
│   ├── Feature 5: Spoiler Text Blur Masking & Text Format Action Bar
│   └── Feature 6: Channel Pinned Messages & Editable Topics
│
└── 🚀 Phase 4: WebRTC Audio HUD & Archiving
    ├── Feature 7: Audio/Video Input Device Selector
    ├── Feature 8: Voice Activity Detection (VAD) Visualizer Avatar Ring
    ├── Feature 9: Native WebRTC Noise & Echo Suppression Toggles
    ├── Feature 14: One-Click Chat History Export (Markdown / JSON)
    └── Feature 15: Synthesized Sci-Fi UI Sound Effects
```
