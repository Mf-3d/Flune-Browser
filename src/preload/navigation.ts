import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("flune", {
  newTab: () => {
    ipcRenderer.invoke("tab.new"); // 新規タブ
  },
  switchTab: (id: string) => {
    ipcRenderer.invoke("tab.switch", id); // タブを切り替える（tab.activate）
  },
  removeTab: (id: string) => {
    ipcRenderer.invoke("tab.remove", id); // タブ削除
  },
  moveTab: () => {
    ipcRenderer.invoke("tab.move"); // タブ移動
  },
  load: (id: string, word: string) => {
    ipcRenderer.invoke("tab.load", id, word); // ページをロードする
  },
  goForward: () => {
    ipcRenderer.invoke("tab.go-forward"); // 次に進む
  },
  goBack: () => {
    ipcRenderer.invoke("tab.go-back"); // 前に戻る
  },
  reloadTab: (ignoringCache?: boolean) => {
    ipcRenderer.invoke("tab.reload", ignoringCache); // 再読み込みする
  },
  toggleMenu: () => {
    ipcRenderer.invoke("options.toggle"); // メニューを開く
  },

  on: (channel: string, callback: Function) => ipcRenderer.on(channel, (event, ...args) => callback(event, ...args))
});