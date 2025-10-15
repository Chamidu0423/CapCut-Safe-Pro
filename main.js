const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
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
    icon: path.join(__dirname, 'src', 'img', 'icon.png'),
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

ipcMain.handle('show-in-folder', async (event, filePath) => {
  try {
  shell.showItemInFolder(filePath);
  return { success: true };
  } catch (err) {
    console.error('show-in-folder error:', err);
    return { success: false, error: String(err) };
  }
});

ipcMain.handle('save-file', async (event, srcPath, defaultName, defaultPath) => {
  try {
    if (defaultPath) {
      const destPath = path.join(defaultPath, defaultName);
      // Ensure directory exists
      await fs.mkdir(path.dirname(destPath), { recursive: true });
      await fs.copyFile(srcPath, destPath);
      return { success: true, savedPath: destPath };
    } else {
      const win = BrowserWindow.getFocusedWindow();
      const { canceled, filePath } = await dialog.showSaveDialog(win, {
        defaultPath: defaultName
      });
      if (canceled || !filePath) return { success: false, canceled: true };
      await fs.copyFile(srcPath, filePath);
      return { success: true, savedPath: filePath };
    }
  } catch (err) {
    console.error('save-file error:', err);
    return { success: false, error: String(err) };
  }
});

ipcMain.handle('select-folder', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return canceled ? null : filePaths[0];
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

