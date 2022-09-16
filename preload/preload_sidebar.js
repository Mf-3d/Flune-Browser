const { contextBridge, ipcRenderer, webFrame } = require('electron');

contextBridge.exposeInMainWorld('flune_sidebar_api', {
  return: async (data) => await ipcRenderer.invoke('return', data),
  closeSidebar: async (data) => await ipcRenderer.invoke('closeSidebar', data),
  
  on: (channel, callback) => ipcRenderer.on(channel, (event, argv) => callback(event, argv))
});