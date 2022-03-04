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
    open_tab: async (data) => await ipcRenderer.invoke('open_tab', data),
    remove_tab: async (index, currentindex)=> await ipcRenderer.invoke('remove_tab',index,currentindex),
    new_tab: async (data) => await ipcRenderer.invoke('new_tab', data),
    tab_move: async (data) => await ipcRenderer.invoke('tab_move', data),
    show_context_menu: async (data) => await ipcRenderer.invoke('show_context_menu', data),
    open_setting: async (data) => await ipcRenderer.invoke('open_setting', data),
    close_setting: async (data) => await ipcRenderer.invoke('close_setting', data),
    version: async (data) => await ipcRenderer.invoke('version', data),
    apply_setting: async (data) => await ipcRenderer.invoke('apply_setting', data),
    setindex: async (data) => await ipcRenderer.invoke('setindex', data),

    on: (channel, callback) => ipcRenderer.on(channel, (event, argv)=>callback(event, argv))
  }
);