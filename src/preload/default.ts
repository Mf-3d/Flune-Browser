import { IPC_INVOKE } from "../shared/ipc/channels";
import { ipcRenderer } from "electron";
import { DefaultAPI, Versions, ComputerInfo } from "@/shared/types/preload-api";

// TODO: 公開するべきか検討する
export const DEFAULT: DefaultAPI = {
  baseURL: (!process.argv.includes("--is-packaged=true") && process.env.ELECTRON_RENDERER_URL)
    ? process.env.ELECTRON_RENDERER_URL
    : "flune://",

  getVersion: async () => {
    return await ipcRenderer.invoke(IPC_INVOKE.APP_GET_VERSION); // バージョン取得
  },
  getVersions: async (): Promise<Versions> => {
    return await ipcRenderer.invoke(IPC_INVOKE.APP_GET_VERSIONS); // ElectronやChromeのバージョンも取得
  },
  getComputerInfo: async (): Promise<ComputerInfo> => {
    return await ipcRenderer.invoke(IPC_INVOKE.APP_GET_COMPUTER_INFO);
  },
  showSettingsPage: () => {
    ipcRenderer.invoke(IPC_INVOKE.APP_SHOW_SETTINGS_PAGE);
  },
  showVersionsPage: () => {
    ipcRenderer.invoke(IPC_INVOKE.APP_SHOW_VERSIONS_PAGE);
  },
  quit: (force?: boolean) => {
    ipcRenderer.invoke(IPC_INVOKE.APP_QUIT, force); // 終了する
  },
};