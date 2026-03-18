import path from "node:path";
import { BaseWindow, app } from "electron";

import { TabManager } from "@/main/tab/tab-manager";
import * as packageJson from "@/../package.json";
import { registerWindowEvents } from "./window-events";
import { createNavigationFeature, Navigation } from "../navigation/navigation-feature";
import { TabCollection } from "../tab/tab-collection";
import { OptionMenuFeature } from "../menu/option-menu/feature/option-menu-feature";

import type { Settings } from "@/main/settings";
import type { ApplicationService } from "@/main/application/application-service";
import type { EventBus } from "@/main/infrastructure/event/event-bus";
import type { OptionMenuController } from "@/main/menu/option-menu/controllers/option-menu-controller";

type WindowOptions = {
  appService: ApplicationService;
  settings: Settings;
  eventBus: EventBus;
  bounds?: Electron.Rectangle;
};

export class Window {
  viewY: number = 66;
  /**
   * @deprecated 非公開化する予定
   */
  readonly win: BaseWindow;
  readonly navigation: Navigation;
  readonly optionMenuController: OptionMenuController;
  private readonly appService: ApplicationService;
  private readonly settings: Settings;
  private readonly eventBus: EventBus;
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
  // readonly optionMenuManager: OptionMenuManager;

  constructor(options: WindowOptions) {
    if (options.bounds) this.bounds = options.bounds;

    this.appService = options.appService;
    this.settings = options.settings;
    this.eventBus = options.eventBus;

    this.win = new BaseWindow(this.createWindowConstructorOptions());

    const optionMenuFeature = new OptionMenuFeature(
      this.appService,
      this
    );
    this.optionMenuController = optionMenuFeature.create();

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
    this.tabManager = new TabManager({
      collection: tabCollection,
      settings: this.settings,
      window: this,
      eventBus: this.eventBus
    });

    this.navigation = this.setupNavigation();

    registerWindowEvents(this.win, this.navigation, this.tabManager, this.eventBus, this.settings);
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
      this.appService,
      this,
      {
        viewY: this.viewY,
        themeUrl: currentTheme.url,
        showHomeButton: this.settings.store.get("settings").design.showHomeButton,
      },
      () => {
        this.eventBus.send("navigation:init");
      }
    );

    navigation.attach();

    return navigation;
  }

  getBounds(): Electron.Rectangle {
    return this.win.getBounds();
  }

  getContentBounds(): Electron.Rectangle {
    return this.win.getContentBounds();
  }

  close() {
    this.tabManager.removeAll();
    this.win?.close();
  }
}