import path from "path";
import { IPC_NOTIFY } from "@/shared/ipc/channels";
import { resolveView, ROUTE_MAP } from "@/shared/resolveView";
import { WebContentsView } from "electron";

import type { Window } from "@/main/window/window";
import { ApplicationService } from "@/main/application/application-service";

const OPTION_MENU_PATH = resolveView(ROUTE_MAP.menu.generic);

type OptionMenuEvents = {
  close: () => void
}

export class OptionMenuView {
  readonly view: WebContentsView;
  private events: Partial<OptionMenuEvents> = {}

  on<K extends keyof OptionMenuEvents>(
    event: K,
    handler: OptionMenuEvents[K]
  ) {
    this.events[event] = handler
  }

  private emit<K extends keyof OptionMenuEvents>(event: K) {
    this.events[event]?.()
  }

  constructor(
    private readonly appService: ApplicationService,
    private readonly window: Window
  ) {
    this.view = new WebContentsView({
      webPreferences: {
        preload: path.join(__dirname, "..", "preload", "index.js"),
      }
    });

    if (!this.appService.isPackaged) this.view.webContents.openDevTools();
    this.view.webContents.loadURL(OPTION_MENU_PATH);

    this.registerEvents();
  }

  private registerEvents() {
    this.window.win.on("resize", () => {
      const bounds = this.window.win.getContentBounds();
      
      this.view.setBounds({
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height - this.window.viewY,
      });
    });

    this.view.webContents.on("blur", () => {
      this.emit("close");
    });
  }

  isVisible() {
    return this.window.win.contentView.children.includes(this.view);
  }

  show() {
    this.view.webContents.loadURL(OPTION_MENU_PATH);
    this.window.win.contentView.addChildView(this.view, -1);
  }

  async hide() {
    this.window.win.contentView.removeChildView(this.view);
    this.view.setVisible(false);
  }

  async openAnimation() {
    this.view.webContents.send(IPC_NOTIFY.MENU_OPENING);
  }
  async closeAnimation() {
    this.view.webContents.send(IPC_NOTIFY.MENU_CLOSING);
  }
}