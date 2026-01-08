import * as path from "node:path";
import {
  WebContentsView,
  ipcMain
} from "electron";
import { Base } from "./base-window";
import { buildTabContextMenu, ContextMenuManager } from "./menu";
import { SearchEngine, Settings } from "./settings";
import theme from "./lib/theme";
import Event from "./lib/event";
import { DataManager } from "./lib/data";
import { ContextMenuController } from "./contextMenuController";
import { validateSender } from "./lib/ipc";

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

const contextMenuController = new ContextMenuController();

// -タブ管理
export class TabManager {
  readonly settings: Settings;
  readonly event: Event;
  readonly contextMenuManager: ContextMenuManager;
  private readonly base: Base;
  private readonly data: DataManager;
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
    this.data = new DataManager;
    this.settings = new Settings(this);
    this.event = new Event();
    this.contextMenuManager = new ContextMenuManager(this.base);
    if (bounds) this.bounds = bounds;

    this.base.win.on("resize", () => {
      if (!this.base) return;

      const bounds = this.base.win.getContentBounds();
      [this.bounds.width, this.bounds.height] = [bounds.width, bounds.height - this.base.viewY];
    });

    // IPCチャンネル
    ipcMain.handle("tab.reload", (event, ignoringCache) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      this.reloadTab(undefined, ignoringCache);
    });
    ipcMain.handle("tab.go-back", (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      this.goBack();
    });
    ipcMain.handle("tab.go-forward", (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      this.goForward();
    });
    ipcMain.handle("tab.go-home", (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      this.load(undefined, HOME_URL);
    });
    ipcMain.handle("tab.switch", (event, id) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      this.activateTab(id);
    });
    ipcMain.handle("tab.new", (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      this.newTab(undefined, {
        active: true
      });
    });
    ipcMain.handle("tab.remove", (event, id) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      this.removeTab(id);
    });
    ipcMain.handle("tab.move", (event, from, to) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      this.moveTab(from, to);
    });
    ipcMain.handle("tab.load", (event, id, url) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      this.load(id, url);
    });
    ipcMain.handle("tab.toggle-context-menu", (event, id) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      contextMenuController.setContextType("tab");

      const menu = buildTabContextMenu(this.base, id);
      menu.popup();
      menu.once("menu-will-close", () => {
        contextMenuController.setContextType("normal"); // 閉じられたらタイプをリセットする
      });
    });

    // ナビゲーションから
    ipcMain.handle("nav.toggle-bookmark", (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      this.getActiveTabCurrent()?.entity.webContents.send("nav.toggle-bookmark");
    });
    // タブから
    ipcMain.handle("tab.toggle-bookmark", (event, data: {
      title: string,
      url: string,
    }) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      if (!this.data.bookmarks.existByUrl(data.url)) {
        this.data.bookmarks.add({
          title: data.title,
          url: data.url,
          tag: [],
          parentId: "root", // デフォルトはルート
        });
      } else {
        const bookmark = this.data.bookmarks.getByUrl(data.url);

        if (bookmark) this.data.bookmarks.remove(bookmark.id);
      }
    });
    ipcMain.handle("tab.focus", (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      this.getActiveTabCurrent()?.entity.webContents.focus();
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

  // --IDからタブの位置を取得
  getTabPositionById(id: string): number {
    const position = this.tabs.map(tab => tab.id).indexOf(id);

    return position;
  }

  // --【危険】タブを書き換える
  private rewriteTab(id: string, tab: Tab) {
    const tabPosition = this.getTabPositionById(id);

    if (tabPosition === -1) {
      console.error("Failed to rewrite tab: Unable to retrieve tab positions.");
      console.trace();
      console.error(` "${id}"`, "\n", `"${tab.id}"`, "\n", this.tabs.map((tab) => tab.id));
      return;
    }

    this.tabs[tabPosition] = tab;
  }

  // -- タブのタイトルを設定する
  setTabTitle(id: string, title: string) {
    let tab = this.getTabById(id);

    if (!tab) {
      console.error("Failed to set tab title: Tab does not exist.");
      return;
    }

    tab.title = title;

    this.rewriteTab(id, tab);
  }

  // --新規タブ
  newTab(url: string = HOME_URL,
    options: {
      active?: boolean,
      /**
       * Tab position from **the left**. Counting starts **from 0**.
       */
      position?: number
    } = {}): Tab {
    if (!options.active) options.active = true;

    // ビューを作成
    let entity = new WebContentsView({
      webPreferences: {
        preload: path.join(__dirname, "..", "preload", "browser.js"),
        contextIsolation: true,
        scrollBounce: true,
      }
    });
    entity.setBounds(this.bounds);
    entity.webContents.setVisualZoomLevelLimits(1, 3);

    // 自動でリサイズ
    this.base.win.on("resize", () => {
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
      active: options.active,
      listeners: {}
    };

    // 配列に追加
    if (options.position) {
      this.tabs.splice(options.position + 1, 0, newTab);
    } else {
      this.tabs?.push(newTab);
    }

    this.base.win.contentView.addChildView(newTab.entity);

    this.load(newTab.id, url);

    // イベントを設定
    this.setEvents(newTab.id);

    entity.webContents.setWindowOpenHandler((details) => {
      this.newTab(details.url, {
        active: true
      });

      return {
        action: "deny"
      };
    });

    // レンダラーにも反映
    this.base.send("tab.new", {
      id: newTab.id,
      title: newTab.title,
      active: newTab.active,
      beforeTabId: options.position ? this.tabs[options.position - 1].id : null
    });

    entity.webContents.once("did-finish-load", () => {
      if (!url.startsWith("flune://error")) this.base.send("nav.set-word", url);
    });

    // 必要ならタブをアクティブ化
    if (options.active) this.activateTab(newTab.id);

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
    this.base.send("nav.change-state", "is-bookmarked", this.data.bookmarks.existByUrl(activeTab.entity.webContents.getURL()));
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
  removeAll() {
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
      this.setTabTitle(id, title);
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
      this.base.send("nav.change-state", "is-bookmarked", this.data.bookmarks.existByUrl(tab.entity.webContents.getURL()));
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
        this.updateTheme(tab.id);

        tab.listeners["theme-updated"] = () => {
          this.updateTheme(tab.id)
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
      this.base.send("nav.change-state", "is-bookmarked", this.data.bookmarks.existByUrl(tabUrl));

      // 履歴に追加
      const histories = this.data.histories.getAll();
      if (histories[histories.length - 1].url === tabUrl) return;

      if (tabUrl !== "flune://home") this.data.histories.add({
        title: tab.entity.webContents.getTitle(),
        url: tabUrl,
        date: new Date()
      });
    });
    // ロードが失敗した時
    tab.entity.webContents.on("did-fail-load", (event, errCode) => {
      // 無限ループが発生するのを防ぐ
      if (tab.entity.webContents.getURL().startsWith("flune://error")) return;

      switch (errCode) {
        case (errCodes["server-notfound"]):
          this.load(tab.id, "flune://error/server-notfound.html");
          break;
        default:
          this.load(tab.id, "flune://error/error.html");
          console.warn("Undefined error code:", errCode);
          break;
      }
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

  updateTheme(tabId: string | undefined = this.activeCurrent) {
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
    console.info("Theme has been changed:\n", {
      themeId,
      currentTheme,
      tabId
    });
  }
}