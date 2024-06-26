const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
import { readFile, writeFile } from 'fs/promises';

const folder_path = app.getPath("documents");
const file_path = path.join(folder_path, "./loop-queue-data.json")

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
  });
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.maximize();
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  ipcMain.on('save-data', handleSaveData);
  ipcMain.handle('loadData', handleLoadData);
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
async function handleSaveData(_event, data){
  try{
    await writeFile(file_path, JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
}

async function handleLoadData() {
  try{
    const fileContents = await readFile(file_path, { encoding: 'utf-8'});
    return JSON.parse(fileContents);
  } catch (err){
    console.error( err);
    return { queue: [], history: [], historyLimit: 1 };
  }
}