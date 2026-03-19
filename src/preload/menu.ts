import { MenuAPI } from "../shared/types/preload-api";
import { IPC_INVOKE, IPC_NOTIFY } from "../shared/ipc/channels";
import { ipcRenderer } from "electron";

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

  clickItem: (action) => {
    ipcRenderer.invoke(IPC_INVOKE.MENU_ITEM_CLICK, action); // メニューアイテムをクリック
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
    (event, template) => callback(event, template)
  ),
  onClosing: (callback) => ipcRenderer.on(
    IPC_NOTIFY.MENU_CLOSING,
    (event) => callback(event)
  ),
};