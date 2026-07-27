# ⚡ Aether Node — Futuristic Windows Local Communication App

**Aether Node** is a next-generation Windows desktop application for self-hosted local communication, featuring a unique **Holographic Glassmorphic Sci-Fi Design System**, real-time text chat, high-fidelity WebRTC voice/video mesh, screen sharing, and local persistent data storage with zero third-party telemetry.

---

## 🎨 Fresh New Futuristic Aesthetics

Unlike generic chat apps, Aether features a distinct, ultra-modern Windows desktop UI:
- **Obsidian & Cosmic Neon Glass**: Deep dark space backdrop with glowing neon cyan (`#00F2FE`), electric purple (`#7F00FF`), and emerald indicators.
- **Custom Windows Frameless Titlebar**: Embedded acrylic titlebar with real-time local node ping meter, status indicator, and Windows window action buttons (`Minimize`, `Maximize`, `Close`).
- **Cyber Hologram HUD**: Translucent glass sidebars, reactive active speaker indicators, floating modal cards, and custom scrollbars.
- **Web Audio Synth FX**: Built-in Web Audio sound synthesizer for node join/leave, mic mute, and signal pings.

---

## 💻 Native Windows Desktop Application

Aether is packaged as a native **Windows Desktop Application** powered by **Electron**:
- **Automated Failover Loader**: Automatically loads Vite dev server (`http://localhost:5173`), Express backend (`http://localhost:3001`), or relative static distribution bundle (`dist/index.html`).
- **Relative Asset Paths**: Built with `base: './'` in `vite.config.js` to ensure zero file path resolution issues on Windows local file systems.
- **Windows Frameless Window Controls**: Native window management (Minimize, Maximize, Close).

---

## 🛠️ Quick Start

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### 2. Launch Windows Desktop Application
To launch the native Windows desktop app:
```bash
npm run app
```

### 3. Launch Web Node Version
If you prefer running in your browser:
```bash
npm start
```
- **Web App**: [http://localhost:5173](http://localhost:5173)
- **Node Server**: [http://localhost:3001](http://localhost:3001)

---

## ⚙️ Available Scripts

- `npm run app` - Launches Vite dev server, Express backend, and the Windows Desktop Electron Application.
- `npm run electron` - Launches Electron desktop window directly.
- `npm run dev` - Runs Vite frontend dev server.
- `npm run server` - Runs Node backend server.
- `npm run start` - Launches backend server and Vite dev server simultaneously for browser access.
- `npm run build` - Compiles production-ready bundle.

---

## 📄 License
MIT License. Free for local and commercial self-hosting.
