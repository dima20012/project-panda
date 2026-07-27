const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  flashWindow: () => ipcRenderer.send('flash-window'),
  showNotification: (title, body) => ipcRenderer.send('show-notification', { title, body }),
  getDesktopSources: () => ipcRenderer.invoke('get-desktop-sources'),
  platform: process.platform
});
