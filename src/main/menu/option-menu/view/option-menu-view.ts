import path from "node:path";
import { IPC_NOTIFY } from "@/shared/ipc/channels";
import { resolveView, ROUTE_MAP } from "@/shared/resolveView";
import { WebContentsView } from "electron";

import type { Window } from "@/main/window/window";
import { ApplicationService } from "@/main/application/application-service";

const OPTION_MENU_PATH = resolveView(ROUTE_MAP.menu.generic);

type OptionMenuEvents = {
  close: () => void,
  open: () => void
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
    private readonly window: Window,
    private bounds: Electron.Rectangle
  ) {
    this.view = new WebContentsView({
      webPreferences: {
        preload: path.join(__dirname, "..", "preload", "index.js"),
        transparent: true
      }
    });

    this.view.setBounds(this.bounds);

    if (!this.appService.isPackaged) this.view.webContents.openDevTools();
    this.view.webContents.loadURL(OPTION_MENU_PATH);

    this.registerEvents();
  }

  attach() {
    this.window.win.contentView.addChildView(this.view);
  }

  detach() {
    this.window.win.contentView.removeChildView(this.view);
  }

  private registerEvents() {
    this.window.win.on("resize", () => {
      const windowBounds = this.window.getContentBounds();
      
      this.bounds = {
        x: windowBounds.x,
        y: windowBounds.y,
        width: windowBounds.width,
        height: windowBounds.height - this.window.viewY,
      };

      this.view.setBounds(this.bounds);
    });
  }

  isVisible(): boolean {
    return this.view.getVisible();
  }

  setVisible(visible: boolean) {
    return this.view.setVisible(visible);
  }

  async show() {
    this.attach();
    await this.view.webContents.loadURL(OPTION_MENU_PATH);
    this.view.webContents.focus();
    this.setVisible(true);
  }

  async hide() {
    this.detach();
    this.setVisible(false);
  }

  async openAnimation() {
    this.view.webContents.send(IPC_NOTIFY.MENU_OPENING);
  }
  async closeAnimation() {
    this.view.webContents.send(IPC_NOTIFY.MENU_CLOSING);
  }
}