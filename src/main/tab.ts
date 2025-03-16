import * as path from "node:path";
import {
  WebContentsView,
  ipcMain
} from "electron";
import { Base } from "./base-window";
import { ContextMenuManager, buildContextMenu } from "./menu";
import { SearchEngine, Settings } from "./settings";
import theme from "./theme";
import Event from "./event";

export type Tab = {
  id: string;
  title: string;
  entity: WebContentsView;
  active: boolean;
  listeners: { [eventName: string]: ((...args: any[]) => any) | undefined };
}

const errCodes = {
  "aborted": -3,
  "server-notfound": -105,
  "internet-disconnected": -106,
  "connection-timed-out": -118,
}

// 内部ページのパス
const HOME_URL = "flune://home";

// -タブ管理
export class TabManager {
  readonly settings: Settings;
  readonly event: Event;
  readonly contextMenuManager: ContextMenuManager;
  private readonly base: Base;
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
    this.settings = new Settings(this);
    this.event = new Event();
    this.contextMenuManager = new ContextMenuManager(this.base);
    if (bounds) this.bounds = bounds;

    this.base.win.on('resize', () => {
      if (!this.base) return;

      const bounds = this.base.win.getContentBounds();
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
    ipcMain.handle("flune.ver", () => {
      return process.env.npm_package_version;
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
    let entity = new WebContentsView({
      webPreferences: {
        preload: path.join(__dirname, "..", "preload", "browser.js"),
        contextIsolation: true
      }
    });
    entity.setBounds(this.bounds);

    // 自動でリサイズ
    this.base.win.on('resize', () => {
      if (!this.base || !entity) return;

      const bounds = this.base.win.getContentBounds();

      entity.setBounds({
        x: this.bounds.x,
        y: this.bounds.y,
        width: bounds.width,
        height: bounds.height - this.base.viewY,
      });
    });

    // let title: string = entity.webContents.getTitle();
    let newTab: Tab = {
      id: crypto.randomUUID(),
      title: entity.webContents.getTitle() || url,
      entity,
      active,
      listeners: {}
    };

    // 配列に追加
    this.tabs?.push(newTab);
    this.base.win.contentView.addChildView(newTab.entity);

    this.load(newTab.id, url);

    // イベントを設定
    this.setEvents(newTab.id);

    entity.webContents.setWindowOpenHandler((details) => {
      this.newTab(details.url, true);

      return {
        action: "deny"
      };
    });

    // レンダラーにも反映
    this.base.send("tab.new", {
      id: newTab.id,
      title: newTab.title,
      active: newTab.active
    });

    entity.webContents.once("did-finish-load", () => {
      if (!url.startsWith("flune://error")) this.base.send("nav.set-word", url);
    });

    // 必要ならタブをアクティブ化
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
    this.deleteEvents(tab.id);
    this.base.send("tab.remove", id);

    // 別のタブをアクティブ化
    if (id === this.activeCurrent && i !== -1) {
      if (this.tabs.length < 2) this.base.close();

      const nextTabIndex = i === 0 ? i + 1 : i - 1;
      const nextTab = this.tabs[nextTabIndex];

      console.info("Tab to activate:", `nextTab.id (index: ${nextTabIndex})`, "\nTab list:", this.tabs.map(tab => ({ id: tab.id, title: tab.title })));

      if (!nextTab) {
        console.error("Could not remove tab: Next tab to activate does not exist.");
        return;
      }

      this.activateTab(nextTab.id);
    }

    // ❓
    console.info(`Tab to remove: ${tab.id}`, "\nTab list:", this.tabs.map(tab => ({ id: tab.id, title: tab.title })));

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

    // メインプロセスに反映
    this.tabs = this.tabs.map(tab => ({
      ...tab,
      active: tab.id === id
    }));

    this.activeCurrent = id;

    this.tabs.forEach((tab) => {
      tab.active ? tab.entity.setVisible(true) : tab.entity.setVisible(false);
    });

    // レンダラーにも反映
    this.base.send("tab.activate", activeTab.id);
    this.base.send("nav.change-state", "can-go-back", activeTab.entity.webContents.navigationHistory.canGoBack());
    this.base.send("nav.change-state", "can-go-forward", activeTab.entity.webContents.navigationHistory.canGoForward());
    const activeTabUrl = activeTab.entity.webContents.getURL();
    if (!activeTabUrl.startsWith("flune://error")) this.base.send("nav.set-word", activeTabUrl);

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

    tab.entity.webContents.stop();
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

    tab.entity.webContents.stop();
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
      if (!url.startsWith("flune://error")) this.base.send("nav.set-word", url);
    } else {
      const searchEngine: SearchEngine | undefined = (this.settings.config.get("searchEngines") as SearchEngine[])
        .find((engine) => engine.id === this.settings.config.get("settings.search.engine"));

      const searchUrl: string = searchEngine?.url.replace(/%s/g, url) || `https://google.com/search?q=${url}`;
      tab.entity.webContents.loadURL(searchUrl);
    }

    this.event.send("tab-loaded", tab.id);
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
  closeAll() {
    this.tabs.forEach((tab) => {
      if (!tab) return;
      this.deleteEvents(tab.id, () => tab.entity.webContents.close());
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

    // タイトルが変更されたとき
    tab.entity.webContents.on("page-title-updated", (event, title) => {
      this.base.send("tab.change-state", tab.id, "title", title);
    });
    // ファビコンが変更されたとき
    tab.entity.webContents.on("page-favicon-updated", (event, favicons) => {
      this.base.send("tab.change-state", tab.id, "favicon", favicons[0]);
    });
    // ロードが始まった時
    tab.entity.webContents.on("did-start-loading", () => {
      const tabUrl = tab.entity.webContents.getURL();
      this.base.send("tab.change-state", tab.id, "loading", true);
      if (!tabUrl.startsWith("flune://error")) this.base.send("nav.set-word", tab.entity.webContents.getURL());
    });
    // ロードが停止した時
    tab.entity.webContents.on("did-stop-loading", () => {
      const tabUrl = tab.entity.webContents.getURL();
      this.base.send("nav.change-state", "can-go-back", tab.entity.webContents.navigationHistory.canGoBack());
      this.base.send("nav.change-state", "can-go-forward", tab.entity.webContents.navigationHistory.canGoForward());
      this.base.send("tab.change-state", tab.id, "loading", false);
      if (!tabUrl.startsWith("flune://error")) this.base.send("nav.set-word", tab.entity.webContents.getURL());
      this.base.send("tab.change-state", tab.id, "favicon", "");
      this.base.send("tab.change-state", tab.id, "title", tab.entity.webContents.getTitle());

      if (tab.listeners["theme-updated"]) this.event.off("theme-updated", tab.listeners["theme-updated"]);
      tab.listeners["theme-updated"] = undefined;

      if (tabUrl.startsWith("flune://")) {
        this.appendTheme(tab.id);

        tab.listeners["theme-updated"] = () => {
          this.appendTheme(tab.id)
        };

        this.event.on("theme-updated", tab.listeners["theme-updated"]);
      } else {
        this.settings.closeSettings(tab.id);
      }
    });
    // 音声の状態が変わった時
    tab.entity.webContents.on("audio-state-changed", (event) => {
      this.base.send("tab.change-state", tab.id, "audible", event.audible);
    });
    // ロードが完了した時
    tab.entity.webContents.on("did-finish-load", () => {
      const tabUrl = tab.entity.webContents.getURL();
      if (!tabUrl.startsWith("flune://error")) this.base.send("nav.set-word", tabUrl);
      if (tabUrl === "flune://settings") this.settings.openSettingsAsTab(tab.id);
    });
    // ロードが失敗した時
    tab.entity.webContents.on("did-fail-load", (event, errCode) => {
      // 無限ループが発生するのを防ぐ
      if (tab.entity.webContents.getURL().startsWith("flune://error")) return;

      switch (errCode) {
        case (errCodes["server-notfound"]): this.load(tab.id, "flune://error/server-notfound.html");
        default: this.load(tab.id, "flune://error/error.html");
      }

      console.error(errCode);
    });
    // コンテキストメニュー
    tab.entity.webContents.on("context-menu", (event, params) => {
      let type: ("normal" | "text" | "link" | "image" | "audio" | "video") = "normal";
      if (params.selectionText) type = "text";
      if (params.linkURL || params.linkText) type = "link";
      if (params.mediaType === "image") type = "image";
      if (params.mediaType === "audio") type = "audio";
      if (params.mediaType === "video") type = "video";

      this.contextMenuManager.build({
        type,
        isEditable: params.isEditable,
        canGoBack: tab.entity.webContents.navigationHistory.canGoBack(),
        canGoForward: tab.entity.webContents.navigationHistory.canGoForward(),
        params,
        isNav: false
      }).popup();
    });
  }

  // --イベントを削除
  deleteEvents(id: string, callback?: Function) {
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
    tab.entity.webContents.removeAllListeners("did-finish-loading");
    tab.entity.webContents.removeAllListeners("did-fail-loading");
    tab.entity.webContents.removeAllListeners("context-menu");
    if (tab.listeners["theme-updated"]) this.event.off("theme-updated", tab.listeners["theme-updated"]);
    tab.listeners["theme-updated"] = undefined;

    if (callback) callback();
  }

  appendTheme(tabId: string | undefined = this.activeCurrent) {
    if (!tabId) {
      console.error("Could not append the theme: Tab ID not specified or active tab does not exist.");
      return;
    }

    const tab = this.getTabById(tabId);

    if (!tab) {
      console.error("Could not append the theme: Tab does not exist.");
      return;
    }

    // テーマを追加
    const themeId = this.settings.config.get("settings.design.theme");
    const themes = this.settings.config.get("themes") as {
      id: string;
      name: string;
      url: string;
    }[];
    const currentTheme = themes.find(theme => theme.id === themeId);

    currentTheme ? theme.appendTheme(tab.entity.webContents, currentTheme.url) : "";
  }
}