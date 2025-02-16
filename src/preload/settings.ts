import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("fluneSettings", {
  getVersion: () => {
    return ipcRenderer.invoke("flune.ver"); // バージョン取得
  },
});