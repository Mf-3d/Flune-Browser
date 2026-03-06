import { MenuAPI } from "../shared/types/preload-api";
import { IPC_INVOKE, IPC_NOTIFY } from "../shared/ipc/channels";
import { contextBridge, ipcRenderer } from "electron";

// contextBridge.exposeInMainWorld("flune", {
//   getVersion: async () => {
//     return await ipcRenderer.invoke("flune.get-version"); // バージョン取得
//   },
//   getVersions: async () => {
//     return await ipcRenderer.invoke("flune.get-versions"); // ElectronやChromeのバージョンも取得
//   },
//   getComputerInfo: async () => {
//     return await ipcRenderer.invoke("flune.get-computer-info"); 
//   },
//   closeMenu: () => {
//     ipcRenderer.invoke("menu.close"); // メニューを閉じる
//   },
//   bookmark: {
//     getByFolderId: async (folderId: string) => {
//       return await ipcRenderer.invoke("menu.bookmark.get-by-folder-id", folderId); // ブックマークの追加メニューを開く
//     },
//     add: () => {
//       ipcRenderer.invoke("menu.bookmark.add"); // ブックマークの追加メニューを開く
//     },
//   },
//   newTab: () => {
//     ipcRenderer.invoke("tab.new"); // 新規タブ
//   },
//   showAllBookmarks: () => {
//     ipcRenderer.invoke("flune.show-all-bookmarks"); // ダウンロードしたファイルの一覧を開く
//   },
//   showDownloads: () => {
//     ipcRenderer.invoke("flune.show-downloads"); // ダウンロードしたファイルの一覧を開く
//   },
//   showVersionsPage: () => {
//     ipcRenderer.invoke("flune.show-versions-page"); // バージョン情報のページを開く
//   },
//   openSettings: () => {
//     ipcRenderer.invoke("flune.open-settings"); // 設定ページを開く
//   },
//   quit: () => {
//     ipcRenderer.invoke("flune.quit"); // 終了する
//   },
//   load: (id: string | undefined, word: string) => {
//     ipcRenderer.invoke("tab.load", id, word); // ページをロードする
//   },

//   on: (channel: string, callback: Function) => ipcRenderer.on(channel, (event, ...args) => callback(event, ...args))
// });

export function isMenuPage() {
  const isDev = !process.argv.includes("--is-packaged=true") && !!process.env.ELECTRON_RENDERER_URL;

  if (isDev) {
    const devUrl = new URL(process.env.ELECTRON_RENDERER_URL!);
    return (
      window.location.host === devUrl.host &&
      window.location.pathname.startsWith("/menu/")
    );
  }

  return (
    window.location.protocol === "flune:" &&
    window.location.host.startsWith("menu/")
  );
}

export const MENU: MenuAPI = {
  open: () => {
    ipcRenderer.invoke(IPC_INVOKE.MENU_OPEN); // メニューを開く
  },
  close: () => {
    ipcRenderer.invoke(IPC_INVOKE.MENU_CLOSE); // メニューを閉じる
  },

  /**
   * @deprecated
   */
  bookmark: {
    getByFolderId: async (folderId: string) => {
      return await ipcRenderer.invoke("menu.bookmark.get-by-folder-id", folderId); // ブックマークの追加メニューを開く
    },
    add: () => {
      ipcRenderer.invoke("menu.bookmark.add"); // ブックマークの追加メニューを開く
    },
  },

  onOpening: (callback) => ipcRenderer.on(
    IPC_NOTIFY.MENU_OPENING,
    (event) => callback(event)
  ),
  onClosing: (callback) => ipcRenderer.on(
    IPC_NOTIFY.MENU_CLOSING,
    (event) => callback(event)
  ),
};