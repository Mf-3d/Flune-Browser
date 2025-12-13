import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("fluneSettings", {
  getVersion: async () => {
    return await ipcRenderer.invoke("flune.get-version"); // バージョン取得
  },
  getVersions: async () => {
    return await ipcRenderer.invoke("flune.get-versions"); // ElectronやChromeのバージョンも取得
  },
  store: {
    get: async (key: string) => {
      return await ipcRenderer.invoke("flune.store.config.get", key); // 項目を取得
    },
    getAll: async () => {
      return await ipcRenderer.invoke("flune.store.config.get-all"); // コンフィグをすべて取得
    },
    set: (key: string, value?: any) => {
      ipcRenderer.invoke("flune.store.config.save", key, value); // 項目を保存
    },
    setAll: (value?: any) => {
      ipcRenderer.invoke("flune.store.config.save-all", value); // コンフィグをすべて保存
    },
  }
});