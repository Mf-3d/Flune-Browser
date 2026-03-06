import path from "node:path";
import {
  app,
  dialog,
  WebContentsView,
} from "electron";
import { Window } from "@/main/window/base-window";
import { buildTabContextMenu, ContextMenuManager } from "@/main/menu/context-menu";
import Event from "@/main/lib/event";
import { DataManager } from "@/main/lib/data";
import { ContextMenuController } from "@/main/menu/contextMenuController";
import { resolveView, ROUTE_MAP } from "@/shared/resolveView";
import { IPC_NOTIFY } from "@/shared/ipc/channels";
import { CreatedTab, NavigationState, TabState } from "@/shared/types/preload-api";
import { Settings } from "../settings";

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
const URL_PREFIX = (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) ? process.env.ELECTRON_RENDERER_URL : "flune://";
const HOME_URL = resolveView(ROUTE_MAP.home);
const ERROR_PAGE_DIRECTORY = (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) ? path.join(process.env.ELECTRON_RENDERER_URL, "browser", "error") : "flune://error";
const SETTINGS_URL = resolveView(ROUTE_MAP.settings);
const ERROR_URL = resolveView(ROUTE_MAP.error.generic);
const ERROR_NOTFOUND_URL = resolveView(ROUTE_MAP.error.notFound);
const contextMenuController = new ContextMenuController();

// -タブ管理
export class TabManager {
  // readonly settings: Settings;
  readonly event: Event;
  readonly contextMenuManager: ContextMenuManager;
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

  constructor(
    private readonly window: Window,
    private readonly data: DataManager,
    private readonly settings: Settings,
    bounds?: { width: number; height: number; x: number; y: number }
  ) {
    console.log("TabManager constructor start");

    // this.settings = new Settings(this);
    this.event = new Event();
    this.contextMenuManager = new ContextMenuManager(this.window);
    if (bounds) this.bounds = bounds;

    this.window.win.on("resize", () => {
      const bounds = this.window.win.getContentBounds();
      [this.bounds.width, this.bounds.height] = [bounds.width, bounds.height - this.window.viewY];
    });

    /* 
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
    */
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
        preload: path.join(__dirname, "..", "preload", "index.js"),
        contextIsolation: true,
        scrollBounce: true,
      }
    });
    entity.setBounds(this.bounds);
    entity.webContents.setVisualZoomLevelLimits(1, 3);

    // 自動でリサイズ
    this.window.win.on("resize", () => {
      if (!entity) return;

      const bounds = this.window.win.getContentBounds();

      entity.setBounds({
        x: this.bounds.x,
        y: this.bounds.y,
        width: bounds.width,
        height: bounds.height - this.window.viewY,
      });
    });

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

    this.window.win.contentView.addChildView(newTab.entity);

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
    this.window.navigation.send(IPC_NOTIFY.TAB_CREATED, {
      id: newTab.id,
      title: newTab.title,
      active: newTab.active,
      beforeTabId: options.position ? this.tabs.at(options.position - 1)?.id : null
    } as CreatedTab);

    entity.webContents.once("did-finish-load", () => {
      if (!url.startsWith(ERROR_PAGE_DIRECTORY)) {
        this.window.navigation.send(IPC_NOTIFY.NAVIGATION_UPDATE, {
          input: url,
        } as NavigationState);
      }
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
    this.window.navigation.send(IPC_NOTIFY.TAB_REMOVED, tab.id);

    // 別のタブをアクティブ化
    if (id === this.activeCurrent && i !== -1) {
      if (this.tabs.length < 2) this.window.close();

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
    const tabState: TabState = {
      id: activeTab.id,
      active: true,
    };

    this.window.navigation.send(IPC_NOTIFY.TAB_UPDATED, tabState);
    this.window.navigation.send(IPC_NOTIFY.NAVIGATION_UPDATE, {
      isBookmarked: this.data.bookmarks.existByUrl(activeTab.entity.webContents.getURL()),
      canGoBack: activeTab.entity.webContents.navigationHistory.canGoBack(),
      canGoForward: activeTab.entity.webContents.navigationHistory.canGoForward()
    } as NavigationState);

    const activeTabUrl = activeTab.entity.webContents.getURL();
    if (!activeTabUrl.startsWith(ERROR_PAGE_DIRECTORY)) {
      this.window.navigation.send(IPC_NOTIFY.NAVIGATION_UPDATE, {
        input: activeTabUrl,
      } as NavigationState);
    }

    return activeTab;
  }

  // --タブを移動
  moveTab(fromIndex: number, toIndex: number) {
    if (fromIndex < 0 || fromIndex >= this.tabs.length || toIndex < 0 || toIndex >= this.tabs.length) {
      console.error("Invalid indices");
      return;
    }

    const [movedTab] = this.tabs.splice(fromIndex, 1);

    if (movedTab) this.tabs.splice(toIndex, 0, movedTab);
    else throw new Error("Moved tab does not exist.");

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
      if (!url.startsWith(ERROR_PAGE_DIRECTORY)) {
        this.window.navigation.send(IPC_NOTIFY.NAVIGATION_UPDATE, {
          input: url,
        } as NavigationState);
      }
    } else {
      const engineId = this.settings.searchEngineService.getCurrentSearchEngineId();
      const searchEngine = this.settings.searchEngineService.getEngineById(engineId);

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

      this.window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
        id: tab.id,
        title,
      });
    });
    // ファビコンが変更されたとき
    tab.entity.webContents.on("page-favicon-updated", (event, favicons) => {
      this.window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
        id: tab.id,
        favicon: favicons[0]
      });
    });
    // ロードが始まった時
    tab.entity.webContents.on("did-start-loading", () => {
      const tabUrl = tab.entity.webContents.getURL();
      this.window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
        id: tab.id,
        isLoading: true
      });

      this.window.navigation.send(IPC_NOTIFY.NAVIGATION_UPDATE, {
        isBookmarked: this.data.bookmarks.existByUrl(tab.entity.webContents.getURL()),
      } as NavigationState);

      if (!tabUrl.startsWith(ERROR_PAGE_DIRECTORY)) {
        this.window.navigation.send(IPC_NOTIFY.NAVIGATION_UPDATE, {
          input: tabUrl,
        } as NavigationState);
      }
    });
    // ロードが停止した時
    tab.entity.webContents.on("did-stop-loading", () => {
      const tabUrl = tab.entity.webContents.getURL();

      this.window.navigation.send(IPC_NOTIFY.NAVIGATION_UPDATE, {
        canGoBack: tab.entity.webContents.navigationHistory.canGoBack(),
        canGoForward: tab.entity.webContents.navigationHistory.canGoForward()
      } as NavigationState);

      this.window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
        id: tab.id,
        isLoading: false,
        favicon: "",
        title: tab.entity.webContents.getTitle(),
      });
      this.window.navigation.send(IPC_NOTIFY.NAVIGATION_UPDATE, {
        input: tabUrl,
      } as NavigationState);

      if (tab.listeners["theme-updated"]) this.event.off("theme-updated", tab.listeners["theme-updated"]);
      tab.listeners["theme-updated"] = undefined;

      this.window.navigation.send(
        IPC_NOTIFY.TAB_THEME,
        this.settings.themeService.getThemeById(this.settings.themeService.getCurrentThemeId())
      );

      tab.listeners["theme-updated"] = () => {
        this.window.navigation.send(
          IPC_NOTIFY.TAB_THEME,
          this.settings.themeService.getThemeById(this.settings.themeService.getCurrentThemeId())
        );
      };

      this.event.on("theme-updated", tab.listeners["theme-updated"]);
    });
    // 音声の状態が変わった時
    tab.entity.webContents.on("audio-state-changed", (event) => {
      this.window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
        id: tab.id,
        isAudible: event.audible,
      });
    });
    // ロードが完了した時
    tab.entity.webContents.on("did-finish-load", () => {
      const tabUrl = tab.entity.webContents.getURL();
      if (!tabUrl.startsWith(ERROR_PAGE_DIRECTORY)) {
        this.window.navigation.send(IPC_NOTIFY.NAVIGATION_UPDATE, {
          input: tabUrl,
        } as NavigationState);
      }

      this.window.navigation.send(IPC_NOTIFY.NAVIGATION_UPDATE, {
        isBookmarked: this.data.bookmarks.existByUrl(tabUrl),
      } as NavigationState);

      // 履歴に追加
      if (tabUrl !== HOME_URL) this.data.histories.add({
        title: tab.entity.webContents.getTitle(),
        url: tabUrl,
        date: new Date()
      });
    });
    // ロードが失敗した時
    tab.entity.webContents.on("did-fail-load", (event, errCode) => {
      // 無限ループが発生するのを防ぐ
      if (tab.entity.webContents.getURL().startsWith(ERROR_PAGE_DIRECTORY)) return;

      switch (errCode) {
        case (errCodes["server-notfound"]):
          this.load(tab.id, ERROR_NOTFOUND_URL);
          break;
        default:
          this.load(tab.id, ERROR_URL);
          console.warn("Undefined error code:", errCode);
          break;
      }
    });
    // コンテキストメニュー
    /**
     * @deprecated
     */
    tab.entity.webContents.on("context-menu", (event, params) => {
      let type: ("normal" | "text" | "link" | "image" | "audio" | "video") = "normal";
      if (params.selectionText) type = "text";
      if (params.linkURL ?? params.linkText) type = "link";
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
    // ダウンロードした時
    tab.entity.webContents.session.on("will-download", (event, item) => {
      let download = this.data.downloads.add({
        state: "progressing",
        url: item.getURL(),
        filePath: item.getSavePath(),
        date: new Date(),
        totalSize: item.getTotalBytes() || null,
        receivedSize: item.getReceivedBytes() || null,
        percentComplete: item.getPercentComplete() || null
      });

      item.on("updated", (event, state) => {
        download.state = state;
        download.receivedSize = item.getReceivedBytes() || null;
        download.percentComplete = item.getPercentComplete() || null;
        this.data.downloads.edit(download.id, download);
      });

      item.once("done", (event, state) => {
        download.state = state;
        download.receivedSize = item.getReceivedBytes() || null;
        download.percentComplete = item.getPercentComplete() || null;
        this.data.downloads.edit(download.id, download);
      });
    });
    // 離脱警告
    tab.entity.webContents.on("will-prevent-unload", (event) => {
      const choice = dialog.showMessageBoxSync(this.window.win, {
        type: "question",
        buttons: ["このページを離れる", "キャンセル"],
        title: "このページを離れますか？",
        message: '変更内容が保存されない可能性があります。',
        defaultId: 0,
        cancelId: 1
      });

      const leave = (choice === 0);
      if (leave) {
        event.preventDefault();
      }
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
    tab.entity.webContents.removeAllListeners("will-download");
    tab.entity.webContents.removeAllListeners("will-prevent-unload");
    if (tab.listeners["theme-updated"]) this.event.off("theme-updated", tab.listeners["theme-updated"]);
    tab.listeners["theme-updated"] = undefined;

    if (callback) callback();
  }
}