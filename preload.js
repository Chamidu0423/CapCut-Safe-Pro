const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getVideos: () => ipcRenderer.invoke('get-videos'),
  showInFolder: (filePath) => ipcRenderer.invoke('show-in-folder', filePath)
});

contextBridge.exposeInMainWorld('electronAPI', Object.assign({}, window.electronAPI || {}, {
  saveFile: (srcPath, defaultName) => ipcRenderer.invoke('save-file', srcPath, defaultName)
}));