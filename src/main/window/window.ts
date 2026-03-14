import path from "node:path";
import { BaseWindow, app } from "electron";

import { TabManager } from "@/main/tab/tab-manager";
import { OptionMenuManager } from "@/main/menu/option-menu";
import * as packageJson from "@/../package.json";
import { registerWindowEvents } from "./window-events";
import { createNavigationFeature, Navigation } from "../navigation/navigation-feature";
import { TabCollection } from "../tab/tab-collection";
import { OptionMenuFeature } from "../menu/option-menu/feature/option-menu-feature";

import type { Settings } from "@/main/settings";
import type { DataManager } from "@/main/lib/data";
import type Event from "@/main/lib/event";
import type { ApplicationService } from "../application/application-service";

type WindowOptions = {
  appService: ApplicationService;
  data: DataManager;
  settings: Settings;
  event: Event;
  bounds?: Electron.Rectangle;
};

export class Window {
  viewY: number = 66;
  readonly win: BaseWindow;
  readonly navigation: Navigation;
  private readonly appService: ApplicationService;
  private readonly data: DataManager;
  private readonly settings: Settings;
  private readonly event: Event;
  bounds: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  } = {
      width: 800,
      height: 600
    };
  private readonly optionMenuFeature: OptionMenuFeature;
  readonly tabManager: TabManager;
  // readonly optionMenuManager: OptionMenuManager;

  constructor(options: WindowOptions) {
    if (options.bounds) this.bounds = options.bounds;

    this.appService = options.appService;
    this.data = options.data;
    this.settings = options.settings;
    this.event = options.event;

    this.win = new BaseWindow(this.createWindowConstructorOptions());

    this.optionMenuFeature = new OptionMenuFeature(this.appService, this);
    this.optionMenuFeature.create();

    // this.optionMenuManager = new OptionMenuManager(this,
    //   this.data,
    //   {
    //     width: this.bounds.width,
    //     height: this.bounds.height - this.viewY,
    //     x: 0,
    //     y: this.viewY
    //   }
    // );

    const tabCollection = new TabCollection();
    this.tabManager = new TabManager(tabCollection, this, this.settings, this.event);

    this.navigation = this.setupNavigation();

    registerWindowEvents(this.win, this.navigation, this.tabManager, this.event, this.settings);
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