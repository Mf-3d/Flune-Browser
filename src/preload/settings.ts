import { SettingsAPI } from "../shared/types/preload-api";
import { IPC_INVOKE } from "../shared/ipc/channels";
import { ipcRenderer } from "electron";

// contextBridge.exposeInMainWorld("fluneSettings", {
//   getVersion: async () => {
//     return await ipcRenderer.invoke("flune.get-version"); // バージョン取得
//   },
//   getVersions: async () => {
//     return await ipcRenderer.invoke("flune.get-versions"); // ElectronやChromeのバージョンも取得
//   },
//   store: {
//     get: async (key: string) => {
//       return await ipcRenderer.invoke("flune.store.config.get", key); // 項目を取得
//     },
//     getAll: async () => {
//       return await ipcRenderer.invoke("flune.store.config.get-all"); // コンフィグをすべて取得
//     },
//     set: (key: string, value?: any) => {
//       ipcRenderer.invoke("flune.store.config.save", key, value); // 項目を保存
//     },
//     setAll: (value?: any) => {
//       ipcRenderer.invoke("flune.store.config.save-all", value); // コンフィグをすべて保存
//     },
//   }
// });

export function isSettingsPage() {
  const isDev = !process.argv.includes("--is-packaged=true") && !!process.env.ELECTRON_RENDERER_URL;

  if (isDev) {
    const devUrl = new URL(process.env.ELECTRON_RENDERER_URL!);
    return (
      window.location.host === devUrl.host &&
      window.location.pathname.startsWith("/browser/settings")
    );
  }

  return (
    window.location.protocol === "flune:" &&
    window.location.host.startsWith("settings")
  );
}

export const SETTINGS: SettingsAPI = {
  get: async (key: string) => {
    return await ipcRenderer.invoke(IPC_INVOKE.STORE_GET, key); // 項目を取得
  },
  getAll: async () => {
    return await ipcRenderer.invoke(IPC_INVOKE.STORE_GET_ALL); // コンフィグをすべて取得
  },
  set: (key: string, value?: any) => {
    ipcRenderer.invoke(IPC_INVOKE.STORE_SET, key, value); // 項目を保存
  },
  setAll: (value?: any) => {
    ipcRenderer.invoke(IPC_INVOKE.STORE_SET_ALL, value); // コンフィグをすべて保存
  },
};