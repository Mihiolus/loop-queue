// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    saveData: (data) => ipcRenderer.send('save-data', data),
    dbRun: (statement, bindParameters) => ipcRenderer.send('db-run', statement, bindParameters),
    loadData: () => ipcRenderer.invoke('loadData')
})