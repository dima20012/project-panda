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
    console.log(`[Aether Backend]: ${data.toString().trim()}`);
  });

  serverProcess.stderr?.on('data', (data) => {
    console.error(`[Aether Backend Error]: ${data.toString().trim()}`);
  });
}

function loadContent(win) {
  const tryLoad = async () => {
    try {
      // First try Vite dev server if running
      await win.loadURL('http://localhost:5173');
    } catch (e1) {
      try {
        // Fallback to Express backend server
        await win.loadURL('http://localhost:3001');
      } catch (e2) {
        // Fallback to compiled dist index.html file
        const distFile = path.join(__dirname, '..', 'dist', 'index.html');
        if (fs.existsSync(distFile)) {
          win.loadFile(distFile);
        } else {
          setTimeout(tryLoad, 1000);
        }
      }
    }
  };

  tryLoad();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1380,
    height: 880,
    minWidth: 960,
    minHeight: 640,
    frame: false,
    backgroundColor: '#06080D',
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

  mainWindow.webContents.on('did-fail-load', (e, errorCode, errorDescription) => {
    console.log('did-fail-load:', errorCode, errorDescription);
    setTimeout(() => loadContent(mainWindow), 1000);
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
  setTimeout(createWindow, 400);

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
