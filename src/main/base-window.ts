import path from "node:path";
import {
  BaseWindow,
  WebContentsView,
  Menu,
  ipcMain,
  dialog,
  app
} from "electron";
import { TabManager } from "./tab";
import {
  ContextMenuManager,
  OptionMenuManager,
  buildApplicationMenu,
  buildOptionsMenu
} from "./menu";
import theme from "./lib/theme";
import Event from "./lib/event";
import { ContextMenuController } from "./contextMenuController";
import * as packageJson from "../../package.json";
import { validateSender } from "./lib/ipc";
import { BookmarkService } from "./bookmark/service";
import { registerBookmarkHandler } from "./ipc/bookmarkHandler";
import { DataManager } from "./lib/data";
import { IPC_NOTIFY } from "../shared/ipc/channels";

const contextMenuController = new ContextMenuController();

ipcMain.handle("nav.set-context-type", (event, type) => {
  if (!event.senderFrame) return null;
  if (!validateSender(event.senderFrame)) return null;

  contextMenuController.setContextType(type);
});

// new window
export class Base {
  viewY: number = 66;
  readonly win: BaseWindow;
  readonly nav: WebContentsView;
  bounds: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  } = {
      width: 800,
      height: 600
    };
  tabManager: TabManager;
  optionsMenu: Electron.Menu;
  readonly event: Event;
  readonly contextMenuManager: ContextMenuManager;
  readonly optionMenuManager: OptionMenuManager;

  constructor(
    private readonly bookmarkService: BookmarkService,
    private readonly data: DataManager,
    bounds?: {
      width: number;
      height: number;
      x: number;
      y: number;
    }
  ) {
    if (bounds) this.bounds = bounds;

    this.win = new BaseWindow({
      width: this.bounds.width,
      height: this.bounds.height,
      minWidth: 300,
      minHeight: 300,
      x: this.bounds.x,
      y: this.bounds.y,
      title: `Flune-Browser ${(packageJson.version ?? "3")
        .replace("-beta.", " Beta ")
        .replace("-dev.", " Dev ")
        }`,
      titleBarStyle: "hidden",
      titleBarOverlay: process.platform === "darwin" ? true : {
        color: "#0000",
        symbolColor: "#fff"
        // symbolColor: nativeTheme.shouldUseDarkColors ? "#fff" : "#000"
      },
      show: false,
      // icon: (process.platform === "darwin" ? path.join(__dirname, "..", "image", "icon.icns") : path.join(__dirname, "..", "image", "icon.png"))
      icon: path.join(__dirname, "..", "assets", "image", "icon.png")
    });

    this.tabManager = new TabManager(
      this,
      this.data,
      {
        width: this.bounds.width,
        height: this.bounds.height - this.viewY,
        x: 0,
        y: this.viewY
      }
    );

    if (process.platform === "darwin") this.win.setWindowButtonPosition({
      x: 10,
      y: 8
    });

    Menu.setApplicationMenu(buildApplicationMenu(this));
    this.optionsMenu = buildOptionsMenu(this, this.data);
    this.contextMenuManager = new ContextMenuManager(this);
    this.optionMenuManager = new OptionMenuManager(this,
      this.data,
      {
        width: this.bounds.width,
        height: this.bounds.height - this.viewY,
        x: 0,
        y: this.viewY
      }
    );

    this.nav = new WebContentsView({
      webPreferences: {
        preload: path.join(__dirname, "..", "preload", "navigation.js")
      }
    });
    this.nav.setBounds({
      width: 800,
      height: this.viewY,
      x: 0,
      y: 0
    });
    this.nav.webContents.loadFile(path.join(__dirname, "..", "renderer", "navigation.html"));

    this.win.on('resize', () => {
      if (!this.win || !this.nav) return;

      const bounds = this.win.getContentBounds();

      this.nav.setBounds({
        width: bounds.width,
        height: bounds.height,
        x: 0,
        y: 0,
      });
    });
    this.win.on("close", () => {
      this.nav.webContents.close();
      this.tabManager?.removeAll();
    });

    this.win.contentView.addChildView(this.nav);

    this.nav.webContents.once("did-finish-load", () => {
      if (process.platform === "darwin") this.nav.webContents.executeJavaScript(`
        document.head.innerHTML += '<link rel="stylesheet" href="./style/navigation-mac.css" />';
        console.info("mac");
      `);

      this.event.send("navigation-loaded");

      this.updateTheme();

      this.win.show();

      this.send("flune.toggle-home-button", this.tabManager?.settings.config.get("settings.design.showHomeButton"));
    });
    this.nav.webContents.on("context-menu", (event, params) => {
      contextMenuController.setContextType("normal"); // 一度リセットする。（順序的にこの位置で問題なし）

      if (!this.tabManager) return;

      if (contextMenuController.getContextType() === "tab") {
        event.preventDefault();
        return;
      }

      const activeTab = this.tabManager.getActiveTabCurrent();
      if (!activeTab) return;

      let type: ("normal" | "text" | "link" | "image" | "audio" | "video") = "normal";
      if (params.selectionText) type = "text";
      if (params.linkURL ?? params.linkText) type = "link";
      if (params.mediaType === "image") type = "image";
      if (params.mediaType === "audio") type = "audio";
      if (params.mediaType === "video") type = "video";

      this.contextMenuManager.build({
        type,
        isEditable: params.isEditable,
        canGoBack: activeTab.entity.webContents.navigationHistory.canGoBack(),
        canGoForward: activeTab.entity.webContents.navigationHistory.canGoForward(),
        params,
        isNav: true
      }).popup();
    });

    // 独自イベント
    this.event = new Event();

    this.event.on("theme-updated", (id) => {
      this.updateTheme();
    });
    this.event.on("setting-updated", () => {
      this.send("flune.toggle-home-button", this.tabManager?.settings.config.get("settings.design.showHomeButton"));
    });

    // IPCチャンネル
    ipcMain.handle("options.toggle", (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      // もし表示されていたとしても、オーバーレイに登録されているblurイベントが発火されるから必要ない。
      if (!this.optionMenuManager.isVisible()) this.optionMenuManager.show();
      // this.optionsMenu = buildOptionsMenu(this);
      // this.optionsMenu.popup();
    });
    ipcMain.handle("flune.update-symbol-color", (event, color?: string) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      if (process.platform === "win32" || process.platform === "linux") this.win.setTitleBarOverlay({
        symbolColor: color
      });
    });
    ipcMain.handle("flune.get-version", (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      return packageJson.version;
    });
    ipcMain.handle("flune.get-versions", (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      return {
        flune: packageJson.version,
        electron: process.versions.electron,
        node: process.versions.node,
        chrome: process.versions.chrome,
        v8: process.versions.v8,
      };
    });
    ipcMain.handle("flune.get-computer-info", (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      return {
        arch: process.arch,
        platform: process.platform,
      };
    });
    ipcMain.handle("flune.open-settings", (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      this.tabManager?.load(undefined, "flune://settings");
    });
    ipcMain.handle("flune.show-versions-page", (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      this.tabManager?.load(undefined, "flune://version");
    });
    ipcMain.handle("flune.quit", (event, forced: boolean) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      if (forced) app.quit();

      const choice = dialog.showMessageBoxSync(this.win, {
        type: "question",
        message: "本当に終了しますか？",
        detail: `${this.tabManager?.tabs.length}個のタブを閉じます。`,
        buttons: ["終了する", "キャンセル"],
        defaultId: 0,
        cancelId: 1,
      });

      if (choice === 0) app.quit();
    });

    registerBookmarkHandler(this.tabManager, this.data);
  }

  updateNavigationState() {
    const tab = this.tabManager?.getActiveTabCurrent();
    if (!tab) return;

    const url = tab.entity.webContents.getURL();
    const isBookmarked = this.bookmarkService.isBookmarked(url);

    this.nav.webContents.send(IPC_NOTIFY.NAVIGATION_STATE, {
      url,
      isBookmarked
    });
  }

  updateTheme() {
    // テーマを追加
    const themeId = this.tabManager?.settings.config.get("settings.design.theme");
    const themes: {
      id: string;
      name: string;
      url: string;
    }[] = this.tabManager?.settings.config.get("themes") as {
      id: string;
      name: string;
      url: string;
    }[];
    const currentTheme = themes.find(theme => theme.id === themeId);

    currentTheme ? theme.appendTheme(this.nav.webContents, currentTheme.url) : "";
  }

  close() {
    this.win.close();
  }

  send(channel: string, ...args: any[]) {
    this.nav.webContents.send(channel, ...args);
  }
}