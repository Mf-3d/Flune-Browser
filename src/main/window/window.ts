import path from "node:path";
import {
  BaseWindow,
  ipcMain,
  app
} from "electron";

import { TabManager } from "@/main/tab/tab-manager";
import { OptionMenuManager } from "@/main/menu/option-menu";
import { ContextMenuController } from "@/main/menu/contextMenuController";
import * as packageJson from "@/../package.json";
import { validateSender } from "@/main/ipc/validateSender";
import { resolveView, ROUTE_MAP } from "@/shared/resolveView";
import { registerWindowEvents } from "./window-events";
import { createNavigationFeature, Navigation } from "../navigation/navigation-feature";
import { TabCollection } from "../tab/tab-collection";

import type { Settings } from "@/main/settings";
import type { DataManager } from "@/main/lib/data";
import type Event from "@/main/lib/event";

const SETTINGS_URL = resolveView(ROUTE_MAP.settings);
const VERSION_URL = resolveView(ROUTE_MAP.version);

const contextMenuController = new ContextMenuController();

ipcMain.handle("nav.set-context-type", (event, type) => {
  if (!event.senderFrame) return null;
  if (!validateSender(event.senderFrame)) return null;

  contextMenuController.setContextType(type);
});

export class Window {
  viewY: number = 66;
  readonly win: BaseWindow;
  readonly navigation: Navigation;
  bounds: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  } = {
      width: 800,
      height: 600
    };
  readonly tabManager: TabManager;
  readonly optionMenuManager: OptionMenuManager;

  constructor(
    private readonly data: DataManager,
    private readonly settings: Settings,
    private readonly event: Event,
    bounds?: {
      width: number;
      height: number;
      x: number;
      y: number;
    },
  ) {
    if (bounds) this.bounds = bounds;

    this.win = new BaseWindow(this.createWindowConstructorOptions());

    this.optionMenuManager = new OptionMenuManager(this,
      this.data,
      {
        width: this.bounds.width,
        height: this.bounds.height - this.viewY,
        x: 0,
        y: this.viewY
      }
    );

    const tabCollection = new TabCollection();
    this.tabManager = new TabManager(tabCollection, this, this.settings, this.event);
    this.navigation = this.setupNavigation();

    registerWindowEvents(this.win, this.navigation, this.tabManager, this.event, this.settings);

    // IPCチャンネル
    ipcMain.handle("options.toggle", (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      // もし表示されていたとしても、オーバーレイに登録されているblurイベントが発火されるから必要ない。
      if (!this.optionMenuManager.isVisible()) this.optionMenuManager.show();
      // this.optionsMenu = buildOptionsMenu(this);
      // this.optionsMenu.popup();
    });
    ipcMain.handle("flune.open-settings", (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      // this.tabManager?.load(undefined, SETTINGS_URL);
      this.tabManager.navigate(SETTINGS_URL);
    });
    ipcMain.handle("flune.show-versions-page", (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      // this.tabManager?.load(undefined, VERSION_URL);
      this.tabManager.navigate(VERSION_URL);
    });
  }

  private createWindowConstructorOptions(): Electron.BaseWindowConstructorOptions {
    return {
      width: this.bounds.width,
      height: this.bounds.height,
      minWidth: 300,
      minHeight: 300,
      x: this.bounds.x,
      y: this.bounds.y,
      title: `${app.getName()} ${(packageJson.version ?? "3")
        .replace("-beta.", " Beta ")
        .replace("-dev.", " Dev ")
        }`,
      titleBarStyle: "hidden",
      titleBarOverlay: process.platform === "darwin" ? true : {
        color: "#0000",
        symbolColor: "#fff",
      },
      show: true,
      icon: path.join(__dirname, "..", "..", "assets", "image", "icon.png"),
      trafficLightPosition: {
        x: 10,
        y: 8,
      }
    };
  }

  private setupNavigation(): Navigation {
    let currentTheme = this.settings.themeService.getThemeById(
      this.settings.themeService.getCurrentThemeId()
    );

    if (!currentTheme) throw new Error;

    const navigation = createNavigationFeature(
      this.win,
      {
        viewY: this.viewY,
        themeUrl: currentTheme.url,
        showHomeButton: this.settings.store.get("settings").design.showHomeButton,
      },
      () => {
        this.event.send("navigation-loaded");
      }
    );

    navigation.attach();

    return navigation;
  }

  close() {
    this.tabManager.removeAll();
    this.win?.close();
  }
}