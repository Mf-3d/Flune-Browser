const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    open_url: async (data) => await ipcRenderer.invoke('open_url', data),
    close: async (data) => await ipcRenderer.invoke('close', data),
    maximize: async (data) => await ipcRenderer.invoke('maximize', data),
    minimize: async (data) => await ipcRenderer.invoke('minimize', data),
    maxmin: async (data) => await ipcRenderer.invoke('maxmin', data)
  }
);