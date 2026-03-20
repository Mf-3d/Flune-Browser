import { ipcRenderer } from "electron";
import { IPC_INVOKE, IPC_NOTIFY } from "../shared/ipc/channels.js";
import { NavigationAPI } from "../shared/types/preload-api.js";

export function isNavigationPage() {
  const isDev =
    !process.argv.includes("--is-packaged=true") && !!process.env.ELECTRON_RENDERER_URL;

  if (isDev) {
    const devUrl = new URL(process.env.ELECTRON_RENDERER_URL!);
    return (
      window.location.host === devUrl.host &&
      window.location.pathname.startsWith("/navigation/")
    );
  } else {
    return (
      window.location.protocol === "flune:" &&
      window.location.pathname.startsWith("/navigation/")
    );
  }
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
    navigate: (id, input) => {
      ipcRenderer.invoke(IPC_INVOKE.TAB_NAVIGATE, id, input); // ページをロードする
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

    onCreated: (callback) =>
      ipcRenderer.on(IPC_NOTIFY.TAB_CREATED, (event, tab) => callback(event, tab)),
    onRemoved: (callback) =>
      ipcRenderer.on(IPC_NOTIFY.TAB_REMOVED, (event, id) => callback(event, id)),
    onUpdated: (callback) =>
      ipcRenderer.on(IPC_NOTIFY.TAB_UPDATED, (event, state) => callback(event, state)),

    onReordered: (callback) =>
      ipcRenderer.on(IPC_NOTIFY.TABS_REORDERED, (event, state) => callback(event, state)),
  },

  toggleBookmark: () => {
    ipcRenderer.invoke(IPC_INVOKE.BOOKMARK_TOGGLE); // 開いているタブをブックマークに追加または削除する
  },
  toggleOptionMenu: () => {
    ipcRenderer.invoke(IPC_INVOKE.MENU_TOGGLE); // メニューを開く
  },
  updateSymbolColor: (color) => {
    ipcRenderer.invoke(IPC_INVOKE.APP_UPDATE_SYMBOL_COLOR, color); // シンボルカラーを変更する
  },

  onStateUpdated: (callback) =>
    ipcRenderer.on(IPC_NOTIFY.NAVIGATION_UPDATE, (event, state) =>
      callback(event, state)
    ),
  onInit: (callback) =>
    ipcRenderer.on(IPC_NOTIFY.NAVIGATION_INIT, (event, state) => callback(event, state)),
  onThemeChanged: (callback) =>
    ipcRenderer.on(IPC_NOTIFY.NAVIGATION_THEME, (event, themeUrl) =>
      callback(event, themeUrl)
    ),
};
