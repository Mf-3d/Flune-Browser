import { contextBridge, ipcRenderer, webFrame } from "electron";

contextBridge.exposeInMainWorld("flune", {
  getVersion: async () => {
    return await ipcRenderer.invoke("flune.get-version"); // バージョン取得
  },
  },
  toggleBookmark: (data: {
    session: number,
    url: string,
    title: string,
  }) => {
    if (data.session === webFrame.routingId) ipcRenderer.invoke("tab.toggle-bookmark", {
      url: data.url,
      title: data.title
    });
  },
  load: (word: string) => {
    ipcRenderer.invoke("tab.load", undefined, word); // ページをロードする
  },
});

ipcRenderer.on("nav.toggle-bookmark", (event) => {
  webFrame.executeJavaScript(`
  flune.toggleBookmark({
    session: ${webFrame.routingId},
    url: location.href,
    title: document.head.getElementsByTagName('title')[0].innerText,
  });
  `)
});