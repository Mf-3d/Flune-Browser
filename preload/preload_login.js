const { contextBridge, ipcRenderer, webFrame } = require('electron');

contextBridge.exposeInMainWorld('flune_api', {
  login: async (data) => await ipcRenderer.invoke('login', data)
});