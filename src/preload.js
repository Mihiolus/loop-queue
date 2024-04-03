// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    addQueue: (itemName) => ipcRenderer.send('add-queue', itemName),
    loadData: () => ipcRenderer.invoke('loadData')
})