// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    addQueue: (itemName) => ipcRenderer.send('add-queue', itemName),
    addToPlan: (itemName) => ipcRenderer.send('add-plan', itemName),
    deleteItem: (itemIndex) => ipcRenderer.send('delete', itemIndex),
    renameItem: (index, newName) => ipcRenderer.send('rename-item', index, newName),
    loadData: () => ipcRenderer.invoke('loadData')
})