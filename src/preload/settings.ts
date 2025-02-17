import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("fluneSettings", {
  getVersion: () => {
    return ipcRenderer.invoke("flune.ver"); // バージョン取得
  },
  store: {
    get: (key: string) => {
      return ipcRenderer.invoke("flune.store.config.get", key); // 項目を取得
    },
    getAll: () => {
      return ipcRenderer.invoke("flune.store.config.get-all"); // コンフィグをすべて取得
    },
    save: (key: string, value?: any) => {
      return ipcRenderer.invoke("flune.store.config.save", key, value); // 項目を保存
    },
    saveAll: (value?: any) => {
      return ipcRenderer.invoke("flune.store.config.save-all", value); // コンフィグをすべて保存
    },
  }
});