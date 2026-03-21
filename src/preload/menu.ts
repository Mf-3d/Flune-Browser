import { IPC_INVOKE, IPC_NOTIFY } from "../shared/ipc/channels";
import { ipcRenderer } from "electron";
import { MenuPageId } from "@/shared/types/menu";
import { config } from "@/app.config";

import type { MenuAPI } from "../shared/types/preload-api";

export function isMenuPage() {
  const isDev =
    !process.argv.includes("--is-packaged=true") && !!process.env.ELECTRON_RENDERER_URL;

  if (isDev) {
    const devUrl = new URL(process.env.ELECTRON_RENDERER_URL!);
    return (
      window.location.host === devUrl.host &&
      window.location.pathname.startsWith("/menu/")
    );
  } else {
    return (
      window.location.protocol === `${config.protocol}:` &&
      window.location.pathname.startsWith("/menu/")
    );
  }
}

export const MENU: MenuAPI = {
  open: () => {
    ipcRenderer.invoke(IPC_INVOKE.MENU_OPEN); // メニューを開く
  },
  close: () => {
    ipcRenderer.invoke(IPC_INVOKE.MENU_CLOSE); // メニューを閉じる
  },

  clickItem: (action) => {
    ipcRenderer.invoke(IPC_INVOKE.MENU_ITEM_CLICKED, action); // メニューアイテムをクリック
  },

  getPage: (menuId: MenuPageId) => {
    return ipcRenderer.invoke(IPC_INVOKE.MENU_GET_PAGE, menuId);
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

  onOpening: (callback) =>
    ipcRenderer.on(IPC_NOTIFY.MENU_OPENING, (event) => callback(event)),
  onClosing: (callback) =>
    ipcRenderer.on(IPC_NOTIFY.MENU_CLOSING, (event) => callback(event)),
};
