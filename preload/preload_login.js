const { contextBridge, ipcRenderer, webFrame } = require('electron');

contextBridge.exposeInMainWorld('flune_login_api', {
  login: async (data) => await ipcRenderer.invoke('login', data),
  on: (channel, callback) => ipcRenderer.on(channel, (event, argv) => callback(event, argv))
});