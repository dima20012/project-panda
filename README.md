# 🐼 Project Panda — Futuristic Windows Local Communication App

**Project Panda** is a next-generation Windows desktop application for self-hosted local communication, featuring a unique **Holographic Glassmorphic Sci-Fi Design System**, real-time text chat, high-fidelity WebRTC voice/video mesh, screen sharing, and local persistent data storage with zero third-party telemetry.

- **GitHub Repository**: [https://github.com/dima20012/project-panda](https://github.com/dima20012/project-panda)
- **Latest Windows Release & Setup File**: [https://github.com/dima20012/project-panda/releases](https://github.com/dima20012/project-panda/releases)

---

## 📦 Windows Setup Installer & GitHub Releases

Whenever a new version of Project Panda is compiled, the Windows Setup Installer (`Project Panda Setup.exe`) is automatically attached to the GitHub Release:

- **Download Installer**: [Project Panda v1.0.0 Release](https://github.com/dima20012/project-panda/releases/tag/v1.0.0)
- **Local File Path**: `C:\ProjectDC\release\Project Panda Setup 1.0.0.exe` (or `C:\ProjectDC\Project Panda Setup.exe`)

---

## 🚀 Publishing New Releases

To compile and upload a new version setup installer to GitHub Releases:

```bash
npm run release -- v1.0.1 "release/Project Panda Setup 1.0.0.exe" --title "v1.0.1" --notes "Release notes"
```

---

## ⚙️ Available Scripts

- `npm run app` - Launches the Windows Desktop Application locally.
- `npm run dist` - Re-compiles the Windows Setup Installer executable in `./release`.
- `npm run release` - Compiles installer and creates a new published GitHub Release with attached `.exe` setup file.
- `npm run build` - Compiles production-ready frontend bundle.

---

## 📄 License
MIT License. Free for local and commercial self-hosting.
