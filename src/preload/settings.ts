import { SettingsAPI } from "../shared/types/preload-api";
import { IPC_INVOKE } from "../shared/ipc/channels";
import { ipcRenderer } from "electron";

export function isSettingsPage() {
  const isDev =
    !process.argv.includes("--is-packaged=true") && !!process.env.ELECTRON_RENDERER_URL;

  if (isDev) {
    const devUrl = new URL(process.env.ELECTRON_RENDERER_URL!);
    return (
      window.location.host === devUrl.host &&
      window.location.pathname.startsWith("/browser/settings/")
    );
  } else {
    return (
      window.location.protocol === "flune:" &&
      window.location.pathname.startsWith("/browser/settings/")
    );
  }
}

export const SETTINGS: SettingsAPI = {
  get: async (key) => {
    return await ipcRenderer.invoke(IPC_INVOKE.STORE_GET, key); // 項目を取得
  },
  getAll: async () => {
    return await ipcRenderer.invoke(IPC_INVOKE.STORE_GET_ALL); // コンフィグをすべて取得
  },
  set: async (key, value?) => {
    await ipcRenderer.invoke(IPC_INVOKE.STORE_SET, key, value); // 項目を保存
  },
  setAll: async (value?) => {
    await ipcRenderer.invoke(IPC_INVOKE.STORE_SET_ALL, value); // コンフィグをすべて保存
  },
};
