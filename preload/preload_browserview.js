const { contextBridge, ipcRenderer, webFrame } = require('electron')
const Store = require('electron-store');
const store = new Store();

contextBridge.exposeInMainWorld('flune_api', {
    new_tab: async (data) => await ipcRenderer.invoke('new_tab', data),
    open_tab: async (data) => await ipcRenderer.invoke('open_tab', data),
    go_back: async (data) => await ipcRenderer.invoke('go_back', data),
    go_forward: async (data) => await ipcRenderer.invoke('go_forward', data),
    close_tab: async (data) => await ipcRenderer.invoke('close_tab', data),
    searchURL: async (data) => await ipcRenderer.invoke('searchURL', data),
    reload: async (data) => await ipcRenderer.invoke('reload', data),
    context: async (data) => await ipcRenderer.invoke('context', data),
    toggle_setting: async (data) => await ipcRenderer.invoke('toggle_setting', data),
    save_setting: async (data) => await ipcRenderer.invoke('save_setting', data),
    get_setting: async (data) => await ipcRenderer.invoke('get_setting', data),
    theme_path: async (data) => await ipcRenderer.invoke('theme_path', data),

    on: (channel, callback) => ipcRenderer.on(channel, (event, argv)=>callback(event, argv))
  }
);

let setting = store.get('settings', {
    "settings": {
        "force_twemoji": false,
        "theme": "theme_dark"
    }
});

if(setting.force_twemoji){
    webFrame.executeJavaScript(`
        // context menu
        window.oncontextmenu = (event) => {
            event.preventDefault();
            window.flune_api.context();
        }
    
        window.addEventListener('DOMContentLoaded', () => {
            let twemoji_script_tag = document.createElement('script');
            twemoji_script_tag.src = "https://twemoji.maxcdn.com/v/latest/twemoji.min.js";
            twemoji_script_tag.crossorigin = "anonymous";
            document.getElementsByTagName("head")[0].appendChild(twemoji_script_tag);
        });

        window.addEventListener('load', () => {
            twemoji.parse(document.body);
        });
    `);
    
    webFrame.insertCSS(`img.emoji {
        height: 1em;
        width: 1em;
        margin: 0 .05em 0 .1em;
        vertical-align: -0.1em;
    }`);
}

