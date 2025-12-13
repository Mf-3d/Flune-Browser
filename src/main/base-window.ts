import path from "node:path";
import {
  BaseWindow,
  WebContentsView,
  Menu,
  ipcMain
} from "electron";
import { TabManager } from "./tab";
import {
  ContextMenuManager,
  buildApplicationMenu,
  buildOptionsMenu
} from "./menu";
import theme from "./lib/theme";
import Event from "./lib/event";
import { ContextMenuController } from "./contextMenuController";

const contextMenuController = new ContextMenuController();

ipcMain.handle("nav.set-context-type", (event, type) => {
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
  tabManager?: TabManager;
  optionsMenu: Electron.Menu;
  readonly event: Event;
  readonly contextMenuManager: ContextMenuManager;

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
      title: `Flune-Browser ${(process.env.npm_package_version || "3")
        .replace("-beta.", " Beta ")
        .replace("-dev.", " Dev ")
        }`,
      titleBarStyle: "hidden",
      titleBarOverlay: process.platform === "darwin" ? true : {
        color: "#0000",
        symbolColor: "#fff"
        // symbolColor: nativeTheme.shouldUseDarkColors ? "#fff" : "#000"
      },
      // icon: (process.platform === "darwin" ? path.join(__dirname, "..", "image", "icon.icns") : path.join(__dirname, "..", "image", "icon.png"))
      icon: path.join(__dirname, "..", "assets", "image", "icon.png")
    });

    if (process.platform === "darwin") this.win.setWindowButtonPosition({
      x: 10,
      y: 8
    });

    Menu.setApplicationMenu(buildApplicationMenu(this));
    this.optionsMenu = buildOptionsMenu(this);
    this.contextMenuManager = new ContextMenuManager(this);

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

      if (process.platform === "darwin") this.nav.webContents.executeJavaScript(`
        document.head.innerHTML += '<link rel="stylesheet" href="./style/navigation-mac.css" />';
        console.info("mac");
      `);

      this.event.send("navigation-loaded");

      this.updateTheme();
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
      this.updateTheme();
    });
    this.event.on("setting-updated", () => {
      this.send("flune.toggle-home-button", this.tabManager?.settings.config.get("settings.design.showHomeButton"));
    });

    // IPCチャンネル
    ipcMain.handle("options.toggle", () => {
      this.optionsMenu = buildOptionsMenu(this);
      this.optionsMenu.popup();
    });
    ipcMain.handle("flune.update-symbol-color", (event, color?: string) => {
      if (process.platform === "win32" || process.platform === "linux") this.win.setTitleBarOverlay({
        symbolColor: color
      });
    });
    ipcMain.handle("flune.get-version", () => {
      return process.env.npm_package_version;
    });
    ipcMain.handle("flune.get-versions", () => {
      return {
        flune: process.env.npm_package_version,
        electron: process.versions.electron,
        node: process.versions.node,
        chrome: process.versions.chrome,
        v8: process.versions.v8,
      };
    });

    this.win.on("close", () => {
      this.nav.webContents.close();
      this.tabManager?.removeAll();
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