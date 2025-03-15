import path from "node:path";
import {
  BaseWindow,
  WebContentsView,
  Menu,
  ipcMain
} from "electron";
import { TabManager } from "./tab";
import {
  ContextMenu,
  buildContextMenu,
  buildApplicationMenu,
  buildOptionsMenu
} from "./menu";
import theme from "./theme";
import Event from "./event";

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
  tabManager?: TabManager;
  optionsMenu: Electron.Menu;
  readonly event: Event;
  readonly contextMenuManager: ContextMenu;

  constructor(bounds?: {
    width: number;
    height: number;
    x: number;
    y: number;
  }) {
    if (bounds) this.bounds = bounds;

    this.win = new BaseWindow({
      width: this.bounds.width,
      height: this.bounds.height,
      minWidth: 300,
      minHeight: 300,
      x: this.bounds.x,
      y: this.bounds.y,
      title: `Flune-Browser ${process.env.npm_package_version ? process.env.npm_package_version : "3"}`,
      titleBarStyle: "hidden",
      titleBarOverlay: process.platform === "darwin" ? true : {
        color: "#0000",
        symbolColor: "#fff"
        // symbolColor: nativeTheme.shouldUseDarkColors ? "#fff" : "#000"
      },
      // icon: (process.platform === "darwin" ? path.join(__dirname, "..", "image", "icon.icns") : path.join(__dirname, "..", "image", "icon.png"))
      icon: path.join(__dirname, "..", "assets", "image", "icon.png")
    });

    Menu.setApplicationMenu(buildApplicationMenu(this));
    this.optionsMenu = buildOptionsMenu(this);
    this.contextMenuManager = new ContextMenu(this);

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

    this.win.contentView.addChildView(this.nav);

    this.nav.webContents.once("did-finish-load", () => {
      this.tabManager = new TabManager(this, {
        width: this.bounds.width,
        height: this.bounds.height - this.viewY,
        x: 0,
        y: this.viewY
      });

      this.event.send("navigation-loaded");

      this.appendTheme();
    });
    this.nav.webContents.on("context-menu", (event, params) => {
      if (!this.tabManager) return;

      const activeTab = this.tabManager.getActiveTabCurrent();
      if (!activeTab) return;

      let type: ("normal" | "text" | "link" | "image" | "audio" | "video") = "normal";
      if (params.selectionText) type = "text";
      if (params.linkURL || params.linkText) type = "link";
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

    this.event = new Event();

    this.event.on("theme-updated", (id) => {
      this.appendTheme();
    });

    ipcMain.handle("options.toggle", () => {
      this.optionsMenu.popup();
    });
    ipcMain.handle("flune.update-symbol-color", (event, color?: string) => {
      this.win.setTitleBarOverlay({
        symbolColor: color
      });
    });

    this.win.on("close", () => {
      this.nav.webContents.close();
      this.tabManager?.closeAll();
    });
  }

  appendTheme() {
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