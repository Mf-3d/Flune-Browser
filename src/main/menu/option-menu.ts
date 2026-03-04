import {
  app,
  ipcMain,
  WebContentsView
} from "electron";
import path from "node:path";

import { Base } from "@/main/window/base-window";
import { validateSender } from "@/main/ipc/validateSender";
import { DataManager, FolderId } from "@/main/lib/data";
import { resolveView, ROUTE_MAP } from "@/shared/resolveView";

const OPTION_MENU_PATH = resolveView(ROUTE_MAP.menu.generic);

/**
 * @class
 * @deprecated
 */
export class OptionMenuManager {
  readonly base: Base;
  readonly overlay: WebContentsView;
  readonly fadeTime: number = 400;
  /**
   * アニメーション中を含みオーバーレイが表示されているか。
   * 
   * `OptionMenuManager.isVisible()` より早く変更されます。
   */
  showing: boolean = false;
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

  constructor(
    base: Base,
    private readonly data: DataManager,
    bounds?: { width: number; height: number; x: number; y: number }) {
    if (bounds) this.bounds = bounds;
    this.base = base;

    this.overlay = new WebContentsView({
      webPreferences: {
        preload: path.join(__dirname, "..", "preload", "menu.js"),
        contextIsolation: true,
        transparent: true
      }
    });

    this.overlay.setBounds(this.bounds);

    // 自動でリサイズ
    this.base.win.on("resize", () => {
      if (!this.base || !this.overlay) return;

      const bounds = this.base.win.getContentBounds();
      [this.bounds.width, this.bounds.height] = [bounds.width, bounds.height - this.base.viewY];
      this.overlay.setBounds({
        x: this.bounds.x,
        y: this.bounds.y,
        width: bounds.width,
        height: bounds.height - this.base.viewY,
      });
    });
    this.overlay.webContents.on("blur", () => {
      if(this.isVisible()) this.close();
    });

    if (!app.isPackaged) this.overlay.webContents.openDevTools();
    this.overlay.webContents.loadURL(OPTION_MENU_PATH);

    ipcMain.handle("menu.close", (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      this.close();
    });
    ipcMain.handle("menu.bookmark.get-by-folder-id", (event, folderId: FolderId) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      return this.data.bookmarks.folders.getStuff(folderId);
    });
  }

  updateBookmarks(folderId: FolderId = "root") {
    const bookmarks = this.data.bookmarks.folders.getStuff(folderId);
    this.overlay.webContents.send("menu.update-bookmarks", folderId, bookmarks);
  }

  /**
   * オーバーレイが完全に表示されているか。
   * 
   * `OptionMenuManager.isVisible()` より遅く変更されます。
   */
  isVisible() {
    return this.base.win.contentView.children.includes(this.overlay);
  }
  async show() {
    console.debug("A menu has been requested. \nFirst try:", this.isVisible());
    if (this.isVisible()) {
      await new Promise(resolve => {
        setTimeout(resolve, this.fadeTime + 100);
      });

      console.debug("A menu has been requested. \nRetry:", this.isVisible());
      if (this.isVisible()) return;
    }

    this.overlay.webContents.loadURL(OPTION_MENU_PATH);
    this.base.win.contentView.addChildView(this.overlay, -1);
    this.showing = true;
    this.overlay.setVisible(true);
    console.debug("A menu is displayed now.");
  }
  async close() {
    console.debug("A menu has been requested to be hidden. \nFirst try:", this.isVisible());
    if (!this.isVisible()) {
      await new Promise(resolve => {
        setTimeout(resolve, this.fadeTime + 100);
      });

      console.debug("A menu has been requested to be hidden. \nRetry:", this.isVisible());
      if (!this.isVisible()) return;
    }

    this.showing = false;
    this.overlay.webContents.send("menu.close");
    await new Promise(resolve => {
      setTimeout(resolve, this.fadeTime);
    });

    this.base.win.contentView.removeChildView(this.overlay);
    this.overlay.setVisible(false);
    console.debug("A menu is hidden now.");
  }
};