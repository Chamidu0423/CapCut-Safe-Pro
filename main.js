const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

const TARGET_DIR = path.join(
  os.homedir(),
  'AppData',
  'Local',
  'CapCut',
  'User Data',
  'Cache',
  'MotionBlurCache'
);

function createWindow() {
  
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  mainWindow.loadFile('index.html');
  mainWindow.setMenuBarVisibility(false);

}

ipcMain.handle('get-videos', async () => {
  const videoExtensions = ['.mp4', '.webm', '.ogv', '.mov', '.avi', '.mkv', '.flv'];
  try {
    const allFiles = await fs.readdir(TARGET_DIR);
    const videoFiles = allFiles
      .filter(file => videoExtensions.includes(path.extname(file).toLowerCase()))
      .map(file => ({
        name: file,
        path: path.join(TARGET_DIR, file).replace(/\\/g, '/') 
      }));
    return videoFiles;
  } catch (error) {
    console.error('Error reading video directory:', error);
    return { error: `Could not read directory: ${TARGET_DIR}. It might not exist or there is a permission issue.` };
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

