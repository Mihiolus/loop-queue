const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
import { readFile, writeFile } from 'fs/promises';
import Database from 'better-sqlite3';

const folder_path = app.getPath("documents");
const file_path = path.join(folder_path, "./loop-queue-data.json")
const db = new Database(path.join(folder_path, "./loop-queue-data.db"));
db.pragma('journal_mode = WAL');
let info = db.prepare('CREATE TABLE IF NOT EXISTS queue (id INTEGER PRIMARY KEY, name TEXT NOT NULL, index INTEGER NOT NULL);').run();
info = db.prepare('CREATE TABLE IF NOT EXISTS plan (id INTEGER PRIMARY KEY, name TEXT NOT NULL);').run();
db.prepare('CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL').run();
db.prepare(
  `CREATE TABLE IF NOT EXISTS item_categories (
    category_id INTEGER,
    item_id INTEGER,
    PRIMARY KEY (category_id, item_id),
    FOREIGN KEY (category id) REFERENCES categories(id),
    FOREIGN KEY (item_id) REFERENCES queue(id)
  );`
).run();

const items = db.prepare('SELECT * FROM queue').all();

for (const item of items){
  console.log(item.name);
}

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
  ipcMain.on('db-run', handleDBRun);
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

async function handleDBRun(_event, SQLStatement, [...bindParameters]){
  db.prepare(SQLStatement).run(bindParameters);
}

async function handleDBAll(SQLStatement, [...bindParameters]){
  return db.prepare(SQLStatement).all(bindParameters);
}