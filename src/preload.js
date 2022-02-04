const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    open_url: async (data) => await ipcRenderer.invoke('open_url', data),
    pageback: async (data) => await ipcRenderer.invoke('pageback', data),
    pageforward: async (data) => await ipcRenderer.invoke('pageforward', data),
    open_home: async (data) => await ipcRenderer.invoke('open_home', data),
    close: async (data) => await ipcRenderer.invoke('close', data),
    maximize: async (data) => await ipcRenderer.invoke('maximize', data),
    minimize: async (data) => await ipcRenderer.invoke('minimize', data),
    maxmin: async (data) => await ipcRenderer.invoke('maxmin', data),
    bv_url: async (data) => await ipcRenderer.invoke('bv_url', data),

    on: (channel, callback) => ipcRenderer.on(channel, (event, argv)=>callback(event, argv))
  }
);