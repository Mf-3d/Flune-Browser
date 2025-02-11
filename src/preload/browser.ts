import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("flune", {
  getVersion: () => {
    return ipcRenderer.invoke("flune.ver"); // バージョン取得
  },
  load: (word: string) => {
    ipcRenderer.invoke("tab.load", undefined, word); // ページをロードする
  },
});