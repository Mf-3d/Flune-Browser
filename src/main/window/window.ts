import path from "node:path";
import { BaseWindow } from "electron";

import { TabManager } from "@/main/tab/tab-manager";
import { registerWindowEvents } from "./window-events";
import {
  createNavigationFeature,
  Navigation,
} from "@/main/navigation/navigation-feature";
import { TabCollection } from "@/main/tab/tab-collection";
import { OptionMenuController } from "@/main/menu/option-menu/controllers/option-menu-controller";
import { OptionMenuView } from "../menu/option-menu/view/option-menu-view";

import type { Settings } from "@/main/settings";
import type { ApplicationService } from "@/main/application/application-service";
import type { EventBus } from "@/main/infrastructure/event/event-bus";
import type { BookmarkService } from "../bookmark/service";
import type { Rect } from "@/shared/types/rect";

type WindowContext = {
  appService: ApplicationService;
  bookmarkService: BookmarkService;
  settings: Settings;
  eventBus: EventBus;
  bounds?: Rect;
};

export class Window {
  viewY: number = 66;

  private readonly win: BaseWindow;
  readonly navigation: Navigation;
  readonly optionMenuController: OptionMenuController;
  private readonly appService: ApplicationService;
  private readonly bookmarkService: BookmarkService;
  private readonly settings: Settings;
  private readonly eventBus: EventBus;

  readonly tabManager: TabManager;

  constructor(options: WindowContext) {
    this.appService = options.appService;
    this.bookmarkService = options.bookmarkService;
    this.settings = options.settings;
    this.eventBus = options.eventBus;

    this.win = new BaseWindow(this.createWindowConstructorOptions(options.bounds));

    const optionMenuView = new OptionMenuView(this.appService, this, {
      x: 0,
      y: this.viewY,
      width: options.bounds ? options.bounds.width : this.getBounds().width,
      height: options.bounds ? options.bounds.height : this.getBounds().height,
    });
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
      bookmarkService: this.bookmarkService,
      eventBus: this.eventBus,
    });

    this.navigation = this.setupNavigation();

    registerWindowEvents(
      this.win,
      this.navigation,
      this.tabManager,
      this.eventBus,
      this.settings
    );
  }

  private createWindowConstructorOptions(
    bounds?: Partial<Rect>
  ): Electron.BaseWindowConstructorOptions {
    return {
      ...(bounds
        ? {
            width: bounds.width,
            height: bounds.height,
            x: bounds.x,
            y: bounds.y,
          }
        : {}),
      minWidth: 300,
      minHeight: 300,
      title: `${this.appService.name} ${this.appService
        .getVersion()
        .replace("-beta.", " Beta ")
        .replace("-dev.", " Dev ")}`,
      titleBarStyle: "hidden",
      titleBarOverlay:
        process.platform === "darwin"
          ? true
          : {
              color: "#0000",
              symbolColor: "#fff",
            },
      show: true,
      icon: path.join(__dirname, "..", "..", "assets", "image", "icon.png"),
      trafficLightPosition: {
        x: 10,
        y: 8,
      },
    };
  }

  private setupNavigation(): Navigation {
    let currentTheme = this.settings.themeService.getThemeById(
      this.settings.themeService.getCurrentThemeId()
    );

    if (!currentTheme) throw new Error();

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
    return this.win
      ? this.win.getBounds()
      : {
          x: 0,
          y: 0,
          width: 800,
          height: 600,
        };
  }

  setBounds(rect: Partial<Rect>) {
    this.win.setBounds(rect);
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
