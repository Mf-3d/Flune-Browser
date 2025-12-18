import { contextBridge, ipcRenderer, webFrame } from "electron";

contextBridge.exposeInMainWorld("flune", {
  getVersion: async () => {
    return await ipcRenderer.invoke("flune.get-version"); // バージョン取得
  },
  getVersions: async () => {
    return await ipcRenderer.invoke("flune.get-versions"); // ElectronやChromeのバージョンも取得
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