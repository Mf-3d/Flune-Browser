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
    context_img: async (data) => await ipcRenderer.invoke('context_img', data),
    toggle_setting: async (data) => await ipcRenderer.invoke('toggle_setting', data),
    save_setting: async (data) => await ipcRenderer.invoke('save_setting', data),
    get_setting: async (data) => await ipcRenderer.invoke('get_setting', data),
    theme_path: async (data) => await ipcRenderer.invoke('theme_path', data),
    copy: async (data) => await ipcRenderer.invoke('copy', data),
    getWinSize: async (data) => await ipcRenderer.invoke('getWinSize', data),

    on: (channel, callback) => ipcRenderer.on(channel, (event, argv) => {
        if(channel !== 'なにか'){
            callback(event, argv);
        }
    })
  }
);

let setting = store.get('settings', {
    "settings": {
        "force_twemoji": false,
        "theme": "theme_dark"
    }
});

webFrame.executeJavaScript(`
    window.flune_api.on('copy_selection', async () => {
        window.flune_api.copy(String(document.getSelection()));
    });

    // window.oncontextmenu = (event) => {
    //     event.preventDefault();
    //     window.flune_api.context();
    // }

    window.addEventListener('DOMContentLoaded', () => {
        let glottologist_script_tag = document.createElement('script');
        glottologist_script_tag.src = "https://unpkg.com/glottologist"
        document.getElementsByTagName("head")[0].appendChild(glottologist_script_tag);
    });

    window.addEventListener('load', async () => {
    });
`);

if(setting.force_twemoji){
    webFrame.executeJavaScript(`
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
    
    webFrame.insertCSS(`
    img.emoji {
        height: 1em;
        width: 1em;
        margin: 0 .05em 0 .1em;
        vertical-align: -0.1em;
    }

    ::-webkit-scrollbar{
        width: 10px;
        height: 10px;
        max-width: 5vmax;
        max-height: 5vmax;
    }
    ::-webkit-scrollbar-button{
        display: none;
    }
    ::-webkit-scrollbar-thumb{
        background-color: #a0f1e73d;
        border-radius: 5px;
        border: 1px solid #efefef88;
    }
    ::-webkit-scrollbar-corner{
        background-color: #eeec;
    }
    ::-webkit-scrollbar-thumb:hover{
        background-color: #cccc;
    }
    ::-webkit-scrollbar-thumb:active{
        background-color: #aaac;
    }
    `);
}

