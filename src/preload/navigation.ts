import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("flune", {
  newTab: () => {
    ipcRenderer.invoke("tab.new");
  },
  switchTab: (id: string) => {
    ipcRenderer.invoke("tab.switch", id);
  },
  removeTab: (id: string) => {
    ipcRenderer.invoke("tab.remove", id);
  },
  moveTab: () => {
    ipcRenderer.invoke("tab.move");
  },
  load: (word: string) => {
    ipcRenderer.invoke("tab.load", word);
  },
  goForward: () => {
    ipcRenderer.invoke("tab.go-forward");
  },
  goBack: () => {
    ipcRenderer.invoke("tab.go-back");
  },
  reloadTab: (ignoringCache?: boolean) => {
    ipcRenderer.invoke("tab.reload", ignoringCache);
  },
  toggleMenu: () => {
    ipcRenderer.invoke("options.toggle");
  },

  on: (channel: string, callback: Function) => ipcRenderer.on(channel, (event, ...args) => callback(event, ...args))
});