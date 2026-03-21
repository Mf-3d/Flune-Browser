import path from "node:path";
import { IPC_NOTIFY } from "@/shared/ipc/channels";
import { resolveView, ROUTE_MAP } from "@/shared/resolveView";
import { WebContents, WebContentsView } from "electron";

import type { Window } from "@/main/window/window";
import type { ApplicationService } from "@/main/application/application-service";
import type { Rect } from "@/shared/types/rect";

const OPTION_MENU_PATH = resolveView(ROUTE_MAP.menu);

export class OptionMenuView {
  readonly view: WebContentsView;

  get webContents(): WebContents {
    return this.view.webContents;
  }

  constructor(
    private readonly appService: ApplicationService,
    private readonly window: Window,
    private bounds: Rect
  ) {
    this.view = new WebContentsView({
      webPreferences: {
        preload: path.join(__dirname, "..", "preload", "index.js"),
        transparent: true,
      },
    });

    this.view.setBounds(this.bounds);

    if (!this.appService.isPackaged) this.view.webContents.openDevTools();
    this.view.webContents.loadURL(OPTION_MENU_PATH);

    this.registerEvents();
  }

  attach() {
    this.window.appendView(this.view);
  }

  detach() {
    this.window.dependView(this.view);
  }

  private registerEvents() {
    this.window.onResize(() => {
      const windowBounds = this.window.getContentBounds();

      this.bounds = {
        x: this.bounds.x,
        y: this.bounds.y,
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
    await this.webContents.loadURL(OPTION_MENU_PATH);
    this.setVisible(true);
  }

  async hide() {
    this.detach();
    this.setVisible(false);
  }

  sendOpening() {
    this.view.webContents.send(IPC_NOTIFY.MENU_OPENING);
  }
  sendClosing() {
    this.view.webContents.send(IPC_NOTIFY.MENU_CLOSING);
  }
}
