import { IPC_INVOKE } from "../shared/ipc/channels";
import { ipcRenderer } from "electron";

type Versions = {
  flune: string;
  electron: string;
  node: string;
  chrome: string;
  v8: string;
};

type ComputerInfo = {
  arch: string;
  platform: string;
};

export const DEFAULT = {
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
  quit: () => {
    ipcRenderer.invoke(IPC_INVOKE.APP_QUIT); // 終了する
  },
};