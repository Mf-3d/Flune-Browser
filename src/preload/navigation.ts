import { contextBridge, ipcRenderer } from "electron";
import { IPC_INVOKE, IPC_NOTIFY } from "../shared/ipc/channels.js";
import { NavigationAPI, NavigationInit, NavigationState } from "../shared/types/preload-api.js";

// contextBridge.exposeInMainWorld("flune", {
//   baseURL: (!process.argv.includes("--is-packaged=true") && process.env.ELECTRON_RENDERER_URL)
//     ? process.env.ELECTRON_RENDERER_URL
//     : "flune://",
//   newTab: () => {
//     ipcRenderer.invoke("tab.new"); // 新規タブ
//   },
//   switchTab: (id: string) => {
//     ipcRenderer.invoke("tab.switch", id); // タブを切り替える（tab.activate）
//   },
//   removeTab: (id: string) => {
//     ipcRenderer.invoke("tab.remove", id); // タブ削除
//   },
//   moveTab: () => {
//     ipcRenderer.invoke("tab.move"); // タブ移動
//   },
//   load: (id: string | undefined, word: string) => {
//     ipcRenderer.invoke("tab.load", id, word); // ページをロードする
//   },
//   goForward: () => {
//     ipcRenderer.invoke("tab.go-forward"); // 次に進む
//   },
//   goBack: () => {
//     ipcRenderer.invoke("tab.go-back"); // 前に戻る
//   },
//   goHome: () => {
//     ipcRenderer.invoke("tab.go-home"); // ホームを開く
//   },
//   reloadTab: (ignoringCache?: boolean) => {
//     ipcRenderer.invoke("tab.reload", ignoringCache); // 再読み込みする
//   },
//   toggleOptionMenu: () => {
//     ipcRenderer.invoke("options.toggle"); // メニューを開く
//   },
//   updateSymbolColor: (color: string) => {
//     ipcRenderer.invoke("flune.update-symbol-color", color); // シンボルカラーを変更する
//   },
//   toggleBookmark: () => {
//     ipcRenderer.invoke(IPC_INVOKE.BOOKMARK_TOGGLE); // 開いているタブをブックマークに追加または削除する
//   },
//   toggleTabContextMenu: (id: string) => {
//     ipcRenderer.invoke("tab.toggle-context-menu", id);
//   },
//   setContextType: (type: "normal" | "tab") => {
//     ipcRenderer.invoke("nav.set-context-type", type); // 次に開くコンテキストメニューのタイプを設定する
//   },
//   focusPage: (id: string) => {
//     ipcRenderer.invoke("tab.focus", id); // 開いているタブにフォーカスする
//   },

//   onStateUpdated: (callback: Function) => ipcRenderer.on(
//     IPC_NOTIFY.NAVIGATION_STATE,
//     (event, state) => callback(event, state)
//   ),
//   onInit: (callback: Function) => ipcRenderer.on(
//     IPC_NOTIFY.NAVIGATION_INIT,
//     (event, state) => callback(event, state)
//   ),
//   onThemeChanged: (callback: Function) => ipcRenderer.on(
//     IPC_NOTIFY.NAVIGATION_APPLY_THEME,
//     (event, themeUrl) => callback(event, themeUrl)
//   ),

//   on: (channel: string, callback: Function) => ipcRenderer.on(channel, (event, ...args) => callback(event, ...args))
// });

export function isNavigationPage() {
  const isDev = !process.argv.includes("--is-packaged=true") && !!process.env.ELECTRON_RENDERER_URL;

  if (isDev) {
    const devUrl = new URL(process.env.ELECTRON_RENDERER_URL!);
    return (
      window.location.host === devUrl.host &&
      window.location.pathname.startsWith("/navigation")
    );
  }

  return (
    window.location.protocol === "flune:" &&
    window.location.host.startsWith("navigation")
  );
}

export const NAVIGATION: NavigationAPI = {
  focusPage: () => {
    ipcRenderer.invoke(IPC_INVOKE.VIEW_FOCUS); // 開いているタブにフォーカスする
  },

  tab: {
    create: () => {
      ipcRenderer.invoke(IPC_INVOKE.TAB_CREATE); // 新規タブ
    },
    activate: (id) => {
      ipcRenderer.invoke(IPC_INVOKE.TAB_ACTIVATE, id); // タブを切り替える（tab.activate）
    },
    remove: (id) => {
      ipcRenderer.invoke(IPC_INVOKE.TAB_REMOVE, id); // タブ削除
    },
    move: (from, to) => {
      ipcRenderer.invoke(IPC_INVOKE.TAB_MOVE, from, to); // タブ移動
    },
    navigate: (id, word) => {
      ipcRenderer.invoke(IPC_INVOKE.TAB_NAVIGATE, id, word); // ページをロードする
    },
    reload: (options) => {
      ipcRenderer.invoke(IPC_INVOKE.TAB_RELOAD, options); // 再読み込みする
    },
    goForward: () => {
      ipcRenderer.invoke(IPC_INVOKE.TAB_GO_FORWARD); // 次に進む
    },
    goBack: () => {
      ipcRenderer.invoke(IPC_INVOKE.TAB_GO_BACK); // 前に戻る
    },
    goHome: () => {
      ipcRenderer.invoke(IPC_INVOKE.TAB_GO_HOME); // ホームを開く
    },

    onCreated: (callback) => ipcRenderer.on(
      IPC_NOTIFY.TAB_CREATED,
      (event, tab) => callback(event, tab)
    ),
    onRemoved: (callback) => ipcRenderer.on(
      IPC_NOTIFY.TAB_REMOVED,
      (event, id) => callback(event, id)
    ),
    onUpdated: (callback) => ipcRenderer.on(
      IPC_NOTIFY.TAB_UPDATED,
      (event, state) => callback(event, state)
    ),
  },

  toggleBookmark: () => {
    ipcRenderer.invoke(IPC_INVOKE.BOOKMARK_TOGGLE); // 開いているタブをブックマークに追加または削除する
  },
  toggleOptionMenu: () => {
    ipcRenderer.invoke("options.toggle"); // メニューを開く
  },
  updateSymbolColor: (color) => {
    ipcRenderer.invoke(IPC_INVOKE.APP_UPDATE_SYMBOL_COLOR, color); // シンボルカラーを変更する
  },

  onStateUpdated: (callback) => ipcRenderer.on(
    IPC_NOTIFY.NAVIGATION_UPDATE,
    (event, state) => callback(event, state)
  ),
  onInit: (callback) => ipcRenderer.on(
    IPC_NOTIFY.NAVIGATION_INIT,
    (event, state) => callback(event, state)
  ),
  onThemeChanged: (callback) => ipcRenderer.on(
    IPC_NOTIFY.NAVIGATION_THEME,
    (event, themeUrl) => callback(event, themeUrl)
  ),
};