import path from "node:path";
import { BaseWindow } from "electron";

import { TabManager } from "@/main/tab/tab-manager";
import { registerWindowEvents } from "./window-events";
import { createNavigationFeature, Navigation } from "@/main/navigation/navigation-feature";
import { TabCollection } from "@/main/tab/tab-collection";
import { OptionMenuController } from "@/main/menu/option-menu/controllers/option-menu-controller";
import { OptionMenuView } from "../menu/option-menu/view/option-menu-view";

import type { Settings } from "@/main/settings";
import type { ApplicationService } from "@/main/application/application-service";
import type { EventBus } from "@/main/infrastructure/event/event-bus";
import type { BookmarkService } from "../bookmark/service";
import type { Rect } from "@/shared/types/rect";

type WindowOptions = {
  appService: ApplicationService;
  bookmarkService: BookmarkService;
  settings: Settings;
  eventBus: EventBus;
  bounds?: Rect;
};

export class Window {
  viewY: number = 66;
  /**
   * @deprecated 非公開化する予定
   */
  private readonly win: BaseWindow;
  readonly navigation: Navigation;
  readonly optionMenuController: OptionMenuController;
  private readonly appService: ApplicationService;
  private readonly bookmarkService: BookmarkService;
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
  

  constructor(options: WindowOptions) {
    if (options.bounds) this.bounds = options.bounds;

    this.appService = options.appService;
    this.bookmarkService = options.bookmarkService;
    this.settings = options.settings;
    this.eventBus = options.eventBus;

    this.win = new BaseWindow(this.createWindowConstructorOptions());

    const optionMenuView = new OptionMenuView(
      this.appService,
      this,
      {
        x: 0,
        y: this.viewY,
        width: this.bounds.width,
        height: this.bounds.height,
      }
    );
    this.optionMenuController = new OptionMenuController({
      appService: this.appService,
      bookmarkService: this.bookmarkService,
      view: optionMenuView,
      window: this,
      fadeTime: 400,
    });

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
      title: `${this.appService.name} ${
        this.appService.getVersion()
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

  getBounds(): Rect {
    return this.win.getBounds();
  }

  getContentBounds(): Rect {
    return this.win.getContentBounds();
  }

  isDestroyed(): boolean {
    return this.win.isDestroyed();
  }

  close() {
    this.tabManager.removeAll();
    this.win.close();
  }

  setTitleBarOverlay(options: Electron.TitleBarOverlayOptions) {
    this.win.setTitleBarOverlay(options);
  }

  getNativeWindow(): BaseWindow {
    return this.win;
  }

  appendView(view: Electron.View) {
    this.win.contentView.addChildView(view);
  }

  dependView(view: Electron.View) {
    this.win.contentView.removeChildView(view);
  }

  onClose(listener: (event: Electron.Event) => void) {
    this.win.on("close", listener);

    return () => {
      this.win.off("close", listener);
    };
  }

  onResize(listener: () => void) {
    this.win.on("resize", listener);

    return () => {
      this.win.off("resize", listener);
    };
  }
}