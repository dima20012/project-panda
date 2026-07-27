const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function startBackendServer() {
  const serverPath = path.join(__dirname, '..', 'server', 'server.cjs');
  serverProcess = spawn(process.execPath, [serverPath], {
    env: { ...process.env, PORT: 3001 }
  });

  serverProcess.stdout?.on('data', (data) => {
    console.log(`[Project Panda Backend]: ${data.toString().trim()}`);
  });

  serverProcess.stderr?.on('data', (data) => {
    console.error(`[Project Panda Backend Error]: ${data.toString().trim()}`);
  });
}

function checkServerAvailable(url) {
  return new Promise((resolve) => {
    const http = require('http');
    const req = http.get(url, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function loadContent(win) {
  // 1. Check if Vite dev server is active on 5173
  const isViteRunning = await checkServerAvailable('http://localhost:5173');
  if (isViteRunning) {
    console.log('[Project Panda Main]: Connecting to Vite dev server at http://localhost:5173');
    await win.loadURL('http://localhost:5173');
    return;
  }

  // 2. Fallback to production bundled dist/index.html
  const distFile = path.join(__dirname, '..', 'dist', 'index.html');
  if (fs.existsSync(distFile)) {
    console.log('[Project Panda Main]: Loading built app from dist/index.html');
    await win.loadFile(distFile);
    return;
  }

  // 3. Fallback to Express backend server on 3001
  const isExpressRunning = await checkServerAvailable('http://localhost:3001');
  if (isExpressRunning) {
    console.log('[Project Panda Main]: Loading from Express backend at http://localhost:3001');
    await win.loadURL('http://localhost:3001');
    return;
  }

  // If backend is still spawning, retry in 300ms
  setTimeout(() => loadContent(win), 300);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1380,
    height: 880,
    minWidth: 960,
    minHeight: 640,
    frame: false, // Frameless native Windows desktop shell
    backgroundColor: '#090C15',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    }
  });

  mainWindow.webContents.on('crashed', (e) => {
    console.error('Electron webContents crashed:', e);
  });

  loadContent(mainWindow);

  ipcMain.on('window-minimize', () => mainWindow?.minimize());
  ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.on('window-close', () => mainWindow?.close());

  ipcMain.on('flash-window', () => {
    if (mainWindow && !mainWindow.isFocused()) {
      mainWindow.flashFrame(true);
    }
  });

  ipcMain.on('show-notification', (event, { title, body }) => {
    const { Notification } = require('electron');
    if (Notification.isSupported()) {
      new Notification({ title: title || 'Project Panda', body }).show();
    }
  });

  ipcMain.handle('get-desktop-sources', async () => {
    const sources = await desktopCapturer.getSources({ types: ['window', 'screen'] });
    return sources.map(source => ({
      id: source.id,
      name: source.name,
      thumbnail: source.thumbnail.toDataURL()
    }));
  });
}

app.whenReady().then(() => {
  startBackendServer();
  setTimeout(createWindow, 300);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
