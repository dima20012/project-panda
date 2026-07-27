# 🐼 Project Panda — Futuristic Windows Local Communication App

**Project Panda** is a next-generation Windows desktop application for self-hosted local communication, featuring a unique **Holographic Glassmorphic Sci-Fi Design System**, real-time text chat, high-fidelity WebRTC voice/video mesh, screen sharing, and local persistent data storage with zero third-party telemetry.

- **GitHub Repository**: [https://github.com/dima20012/project-panda](https://github.com/dima20012/project-panda)

---

## 📦 Windows Setup Installer

The project includes a standalone Windows Installer Setup file (`Project Panda Setup.exe`):

- **Location**: `C:\ProjectDC\Project Panda Setup.exe` (or `C:\ProjectDC\release\Project Panda Setup 1.0.0.exe`)
- **What it does**: Double-clicking `Project Panda Setup.exe` opens the Windows Installation Wizard, installs the application onto your system, and places shortcuts on your **Desktop** and **Start Menu**.

---

## 🎨 Fresh New Futuristic Aesthetics

Unlike generic chat apps, Project Panda features a distinct, ultra-modern Windows desktop UI:
- **Obsidian & Cosmic Neon Glass**: Deep dark space backdrop with glowing neon cyan (`#00F2FE`), electric purple (`#7F00FF`), and emerald indicators.
- **Custom Windows Frameless Titlebar**: Embedded acrylic titlebar with real-time local node ping meter, status indicator, and Windows window action buttons (`Minimize`, `Maximize`, `Close`).
- **Cyber Hologram HUD**: Translucent glass sidebars, reactive active speaker indicators, floating modal cards, and custom scrollbars.
- **Web Audio Synth FX**: Built-in Web Audio sound synthesizer for node join/leave, mic mute, and signal pings.

---

## 🛠️ Quick Start

### 1. Install via Windows Setup File
Simply double-click `Project Panda Setup.exe` to install and launch Project Panda from your Windows Start Menu!

### 2. Developer Launch Mode
```bash
git clone https://github.com/dima20012/project-panda.git
cd project-panda
npm install
npm run app
```

---

## ⚙️ Available Scripts

- `npm run app` - Launches the Windows Desktop Application locally.
- `npm run dist` - Re-compiles the Windows Setup Installer executable in `./release`.
- `npm run build` - Compiles production-ready frontend bundle.

---

## 📄 License
MIT License. Free for local and commercial self-hosting.
