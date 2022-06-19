const { contextBridge, ipcRenderer, webFrame } = require('electron')

contextBridge.exposeInMainWorld('flune_api', {
    new_tab: async (data) => await ipcRenderer.invoke('new_tab', data),
    open_tab: async (data) => await ipcRenderer.invoke('open_tab', data),
    go_back: async (data) => await ipcRenderer.invoke('go_back', data),
    go_forward: async (data) => await ipcRenderer.invoke('go_forward', data),
    close_tab: async (data) => await ipcRenderer.invoke('close_tab', data),
    searchURL: async (data) => await ipcRenderer.invoke('searchURL', data),
    reload: async (data) => await ipcRenderer.invoke('reload', data),
    context_nav: async (data) => await ipcRenderer.invoke('context_nav', data),
    toggle_setting: async (data) => await ipcRenderer.invoke('toggle_setting', data),
    save_setting: async (data) => await ipcRenderer.invoke('save_setting', data),
    theme_path: async (data) => await ipcRenderer.invoke('theme_path', data),

    on: (channel, callback) => ipcRenderer.on(channel, (event, argv)=>callback(event, argv))
  }
);

webFrame.executeJavaScript(`
  // context menu
  window.oncontextmenu = () => {
    window.flune_api.context_nav();
  }
`);