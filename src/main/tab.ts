import * as path from "node:path";
import {
  WebContentsView,
  ipcMain
} from "electron";
import { Base } from "./base-window";
import { buildContextMenu } from "./menu";

export type Tab = {
  id: string;
  title: string;
  entity: WebContentsView;
  active: boolean;
}

// 内部ページのパス
const HOME_URL = path.join("file://", __dirname, "..", "renderer", "browser", "home.html");

// -タブ管理
export class TabManager {
  private base: Base;
  tabs: Tab[] = [];
  private bounds: {
    width: number;
    height: number;
    x: number;
    y: number;
  } = {
      width: 800,
      height: 600,
      x: 0,
      y: 0
    };
  activeCurrent?: string; // 現在有効化されているタブのID

  constructor(base: Base, bounds?: { width: number; height: number; x: number; y: number }) {
    this.base = base;
    if (bounds) this.bounds = bounds;

    this.base.win.on('resize', () => {
      if (!this.base) return;

      const bounds = this.base.win.getBounds();
      [this.bounds.width, this.bounds.height] = [bounds.width, bounds.height - this.base.viewY];
    });

    // IPCチャンネル
    ipcMain.handle("tab.reload", (event, ignoringCache) => {
      this.reloadTab(undefined, ignoringCache);
    });
    ipcMain.handle("tab.go-back", () => {
      this.goBack();
    });
    ipcMain.handle("tab.go-forward", () => {
      this.goForward();
    });
    ipcMain.handle("tab.switch", (event, id) => {
      this.activateTab(id);
    });
    ipcMain.handle('tab.new', () => {
      this.newTab(undefined, true);
    });
    ipcMain.handle('tab.remove', (event, id) => {
      this.removeTab(id);
    });
    ipcMain.handle('tab.move', (event, from, to) => {
      this.moveTab(from, to);
    });
    ipcMain.handle('tab.load', (event, id, url) => {
      this.load(id, url);
    });
  }

  // --IDからタブを取得
  getTabById(id: string): Tab | undefined {
    return this.tabs.find(tab => (tab.id === id));
  }

  // --現在アクティブなタブを取得
  getActiveTabCurrent(): Tab | undefined {
    return this.tabs.find(tab => (tab.id === this.activeCurrent));
  }

  // --新規タブ
  newTab(url?: string, active: boolean = true): Tab {
    if (!url) url = HOME_URL;

    // ビューを作成
    let entity = new WebContentsView();
    entity.setBounds(this.bounds);
    entity.webContents.loadURL(url);

    // 自動でリサイズ
    this.base.win.on('resize', () => {
      if (!this.base || !entity) return;

      const bounds = this.base.win.getBounds();

      entity.setBounds({
        x: this.bounds.x,
        y: this.bounds.y,
        width: bounds.width,
        height: bounds.height - this.base.viewY,
      });
    });

    let title: string = entity.webContents.getTitle();
    let newTab: Tab = {
      id: crypto.randomUUID(),
      title: title ? title : url,
      entity,
      active
    };

    this.tabs?.push(newTab); // 配列に追加
    this.base.win.contentView.addChildView(newTab.entity);

    // イベントを設定
    this.setEvents(newTab.id);
    entity.webContents.setWindowOpenHandler((details) => {
      this.newTab(details.url, true);

      return {
        action: "deny"
      };
    });

    // レンダラーにも反映
    const tabInfo = {
      id: newTab.id,
      title: newTab.title,
      active: newTab.active
    }
    this.base.send("tab.new", tabInfo);

    entity.webContents.once("did-finish-load", () => {
      this.base.send("nav.set-word", url);
    });

    if (active) this.activateTab(newTab.id);

    return newTab;
  }

  // --タブを削除
  removeTab(id: string) {
    const tab = this.getTabById(id);

    if (!tab) {
      console.error("Could not remove tab: Tab does not exist.");
      return;
    }

    const i = this.tabs.indexOf(tab);

    tab.entity.webContents.close();
    this.base.send("tab.remove", id);

    // 別のタブをアクティブ化
    if (i !== -1) {
      if (this.tabs.length <= 1) this.base.close();

      this.activateTab(this.tabs[i > 0 ? i - 1 : 0].id);
    }

    // 最後に配列から削除
    this.tabs.splice(i, 1);
  }

  // --タブをアクティブ化
  activateTab(id: string): Tab | undefined {
    const activeTab = this.getTabById(id);

    if (!activeTab) {
      console.error("Could not set tab as active: Tab does not exist.");
      return;
    }

    // メインプロセスのタブをアクティブ化
    this.tabs = this.tabs.map(tab => ({
      ...tab,
      active: tab.id === id
    }));

    this.activeCurrent = id;

    this.tabs.forEach(tab => {
      tab.active ? tab.entity.setVisible(true) : tab.entity.setVisible(false);
    });

    // レンダラーにも反映
    this.base.send("tab.activate", activeTab.id);
    this.base.send("nav.set-word", activeTab.entity.webContents.getURL());

    return activeTab;
  }

  // --タブを移動
  moveTab(fromIndex: number, toIndex: number) {
    if (fromIndex < 0 || fromIndex >= this.tabs.length || toIndex < 0 || toIndex >= this.tabs.length) {
      console.error("Invalid indices");
      return;
    }

    const [movedTab] = this.tabs.splice(fromIndex, 1);
    this.tabs.splice(toIndex, 0, movedTab);

    // レンダラーに反映する必要がない
  }

  // --再読み込みする
  reloadTab(id: string | undefined = this.activeCurrent, ignoringCache: boolean = false) {
    if (!id) {
      console.error("Could not reload tab: Tab ID not specified or active tab does not exist.");
      return;
    }

    const tab = this.getTabById(id);

    if (!tab) {
      console.error("Could not reload tab: Tab does not exist.");
      return;
    }

    ignoringCache ? tab.entity.webContents.reloadIgnoringCache : tab.entity.webContents.reload();
  }

  // --前に戻る
  goBack(id: string | undefined = this.activeCurrent) {
    if (!id) {
      console.error("Could not go back: Tab ID not specified or active tab does not exist.");
      return;
    }

    const tab = this.getTabById(id);

    if (!tab) {
      console.error("Could not go back: Tab does not exist.");
      return;
    }

    tab.entity.webContents.navigationHistory.goBack();
  }

  // --次に進む
  goForward(id: string | undefined = this.activeCurrent) {
    if (!id) {
      console.error("Could not go forward: Tab ID not specified or active tab does not exist.");
      return;
    }

    const tab = this.getTabById(id);

    if (!tab) {
      console.error("Could not go forward: Tab does not exist.");
      return;
    }

    tab.entity.webContents.navigationHistory.goForward();
  }

  // --ロードする
  load(id: string | undefined = this.activeCurrent, url: string) {
    if (!id) {
      console.error("Could not load URL: Tab ID not specified or active tab does not exist.");
      return;
    }

    const tab = this.getTabById(id);

    if (!tab) {
      console.error("Could not load URL: Tab does not exist.");
      return;
    }

    if (URL.canParse(url)) {
      tab.entity.webContents.loadURL(url);
      this.base.send("nav.set-word", url);
    } else {
      const searchUrl = `https://google.com/search?q=${url}`
      tab.entity.webContents.loadURL(searchUrl);
      this.base.send("nav.set-word", searchUrl);
    }
  }

  // --開発者ツールを表示
  toggleDevTools(id: string | undefined = this.activeCurrent, options?: {
    mode?: "right" | "left" | "bottom" | "undocked" | "detach"
  }) {
    if (!id) {
      console.error("Could not toggle DevTools: Tab ID not specified or active tab does not exist.");
      return;
    }

    const tab = this.getTabById(id);

    if (!tab) {
      console.error("Could not toggle DevTools: Tab does not exist.");
      return;
    }

    tab.entity.webContents.isDevToolsOpened()
      ? tab.entity.webContents.closeDevTools()
      : tab.entity.webContents.openDevTools({
        mode: options?.mode ? options.mode : "right"
      });
  }

  // --タブをすべて閉じる
  close() {
    this.tabs.forEach((tab) => {
      if (!tab) return;
      this.deleteEvents(tab.id);
      tab.entity.webContents.close();
    });
  }

  // --イベントを設定
  setEvents(id: string) {
    const tab = this.getTabById(id);

    if (!tab) {
      console.error("Could not set events: Tab does not exist.");
      return;
    }

    this.deleteEvents(id);

    tab.entity.webContents.on("page-title-updated", (event, title) => {
      this.base.send("tab.change-state", tab.id, "title", title);
    });
    tab.entity.webContents.on("page-favicon-updated", (event, favicons) => {
      this.base.send("tab.change-state", tab.id, "favicon", favicons[0]);
    });
    tab.entity.webContents.on("did-start-loading", () => {
      this.base.send("tab.change-state", tab.id, "loading", true);
      this.base.send("nav.set-word", tab.entity.webContents.getURL());
    });
    tab.entity.webContents.on("did-stop-loading", () => {
      this.base.send("nav.change-state", "can-go-back", tab.entity.webContents.navigationHistory.canGoBack());
      this.base.send("nav.change-state", "can-go-forward", tab.entity.webContents.navigationHistory.canGoForward());
      this.base.send("tab.change-state", tab.id, "loading", false);
      this.base.send("nav.set-word", tab.entity.webContents.getURL());
    });
    tab.entity.webContents.on("audio-state-changed", (event) => {
      this.base.send("tab.change-state", tab.id, "audible", event.audible);
    });
    tab.entity.webContents.on("did-finish-load", () => {
      this.base.send("nav.set-word", tab.entity.webContents.getURL());
    });
    tab.entity.webContents.on("context-menu", (event, params) => {
      let type: ("normal" | "text" | "link" | "image" | "audio" | "video") = "normal";
      if (params.selectionText) type = "text";
      if (params.linkURL || params.linkText) type = "link";
      if (params.mediaType === "image") type = "image";
      if (params.mediaType === "audio") type = "audio";
      if (params.mediaType === "video") type = "video";

      buildContextMenu(this.base, {
        type,
        isEditable: params.isEditable,
        selectionText: params.selectionText,
        canGoBack: tab.entity.webContents.navigationHistory.canGoBack(),
        canGoForward: tab.entity.webContents.navigationHistory.canGoForward(),
      }).popup();
    });
  }

  // --イベントを削除
  deleteEvents(id: string) {
    const tab = this.getTabById(id);

    if (!tab) {
      console.error("Could not set events: Tab does not exist.");
      return;
    }

    tab.entity.webContents.removeAllListeners("page-title-updated");
    tab.entity.webContents.removeAllListeners("page-favicon-updated");
    tab.entity.webContents.removeAllListeners("did-start-loading");
    tab.entity.webContents.removeAllListeners("did-stop-loading");
    tab.entity.webContents.removeAllListeners("audio-state-changed");
    tab.entity.webContents.removeAllListeners("context-menu");
  }
}