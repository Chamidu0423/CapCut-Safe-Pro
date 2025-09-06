const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getVideos: () => ipcRenderer.invoke('get-videos')
});