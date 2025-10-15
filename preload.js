const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getVideos: () => ipcRenderer.invoke('get-videos'),
  showInFolder: (filePath) => ipcRenderer.invoke('show-in-folder', filePath),
  saveFile: (srcPath, defaultName, defaultPath) => ipcRenderer.invoke('save-file', srcPath, defaultName, defaultPath),
  selectFolder: () => ipcRenderer.invoke('select-folder')
});