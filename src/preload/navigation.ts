import { contextBridge, ipcRenderer } from "electron";
import { IPC_INVOKE, IPC_NOTIFY } from "../shared/ipc/channels.js";

contextBridge.exposeInMainWorld("flune", {
  baseURL: !process.argv.includes("--is-packaged=true")
    ? process.env.ELECTRON_RENDERER_URL
    : "flune://",
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
  load: (id: string | undefined, word: string) => {
    ipcRenderer.invoke("tab.load", id, word); // ページをロードする
  },
  goForward: () => {
    ipcRenderer.invoke("tab.go-forward"); // 次に進む
  },
  goBack: () => {
    ipcRenderer.invoke("tab.go-back"); // 前に戻る
  },
  goHome: () => {
    ipcRenderer.invoke("tab.go-home"); // ホームを開く
  },
  reloadTab: (ignoringCache?: boolean) => {
    ipcRenderer.invoke("tab.reload", ignoringCache); // 再読み込みする
  },
  toggleOptionMenu: () => {
    ipcRenderer.invoke("options.toggle"); // メニューを開く
  },
  updateSymbolColor: (color: string) => {
    ipcRenderer.invoke("flune.update-symbol-color", color); // シンボルカラーを変更する
  },
  toggleBookmark: () => {
    ipcRenderer.invoke(IPC_INVOKE.BOOKMARK_TOGGLE); // 開いているタブをブックマークに追加または削除する
  },
  toggleTabContextMenu: (id: string) => {
    ipcRenderer.invoke("tab.toggle-context-menu", id);
  },
  setContextType: (type: "normal" | "tab") => {
    ipcRenderer.invoke("nav.set-context-type", type); // 次に開くコンテキストメニューのタイプを設定する
  },
  focusPage: (id: string) => {
    ipcRenderer.invoke("tab.focus", id); // 開いているタブにフォーカスする
  },

  onStateUpdated: (callback: Function) => ipcRenderer.on(
    IPC_NOTIFY.NAVIGATION_STATE,
    (event, state) => callback(event, state)
  ),
  on: (channel: string, callback: Function) => ipcRenderer.on(channel, (event, ...args) => callback(event, ...args))
});