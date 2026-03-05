/*

import { IPC_INVOKE } from "../shared/ipc/channels.js";
import { contextBridge, ipcRenderer, webFrame } from "electron";

function isSettingsPage() {
  const isDev = !process.argv.includes("--is-packaged=true") && !!process.env.ELECTRON_RENDERER_URL;

  if (isDev) {
    const devUrl = new URL(process.env.ELECTRON_RENDERER_URL!);
    return (
      window.location.host === devUrl.host &&
      window.location.pathname.startsWith("/settings")
    );
  }

  return (
    window.location.protocol === "flune:" &&
    window.location.host === "settings"
  );
}

if (isSettingsPage()) {
  contextBridge.exposeInMainWorld("fluneSettings", {
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
  });
}

contextBridge.exposeInMainWorld("flune", {
  getVersion: async () => {
    return await ipcRenderer.invoke("flune.get-version"); // バージョン取得
  },
  getVersions: async () => {
    return await ipcRenderer.invoke("flune.get-versions"); // ElectronやChromeのバージョンも取得
  },
  getComputerInfo: async () => {
    return await ipcRenderer.invoke("flune.get-computer-info"); 
  },
  toggleBookmark: (data: {
    session: string,
    url: string,
    title: string,
  }) => {
    // 正しいセッションから実行されているか判定
    if (data.session === webFrame.frameToken) ipcRenderer.invoke("tab.toggle-bookmark", {
      url: data.url,
      title: data.title
    });
  },
  load: (word: string) => {
    ipcRenderer.invoke("tab.load", undefined, word); // ページをロードする
  },
});

// ナビゲーションバーから、ブラウザビューがブックマークを追加するように指示する。
ipcRenderer.on("nav.toggle-bookmark", (event) => {
  webFrame.executeJavaScript(`
  flune.toggleBookmark({
    session: ${webFrame.frameToken},
    url: location.href,
    title: document.head.getElementsByTagName('title')[0].innerText,
  });
  `)
});
*/