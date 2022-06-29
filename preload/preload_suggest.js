const { contextBridge, ipcRenderer, webFrame } = require('electron');
const Store = require('electron-store');
const store = new Store();

contextBridge.exposeInMainWorld('flune_api', {
  getRecentSuggest: async (data) => await ipcRenderer.invoke('getRecentSuggest', data),
  searchURL: async (data) => await ipcRenderer.invoke('searchURL', data),
  closeSuggest: async (data) => await ipcRenderer.invoke('closeSuggest', data)
});