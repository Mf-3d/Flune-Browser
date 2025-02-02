import * as path from "node:path";
import { 
  app, 
  BaseWindow, 
  WebContentsView, 
  nativeTheme,
} from "electron";
import { TabManager, Tab } from "./tab";

// new window
export class Base {
  viewY: number = 66;
  win: BaseWindow;
  nav: WebContentsView;
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
      icon: path.join(__dirname, "..", "image", "icon.png")
    });

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
    // this.nav.webContents.openDevTools();
    this.nav.webContents.loadFile(path.join(__dirname, "..", "renderer", "navigation.html"));
    this.win.on('resize', () => {
      if (!this.win || !this.nav) return;

      const bounds = this.win.getBounds();

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
    })

    this.win.on("close", () => {
      this.nav.webContents.close();
      this.tabManager?.close();
    });
  }

  close () {
    this.win.close();
  }

  send (channel: string, ...args: any[]) {
    this.nav.webContents.send(channel, ...args);
  }
}