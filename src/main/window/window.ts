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
import { OptionMenuView } from "@/main/menu/option-menu/view/option-menu-view";
import { config } from "@/app.config";
import { formatVersion } from "@/shared/format/version-formatter";

import type { Settings } from "@/main/settings";
import type { EventBus } from "@/main/infrastructure/event/event-bus";
import type { BookmarkService } from "@/main/bookmark/service";
import type { HistoryService } from "@/main/history/service";
import type { Rect } from "@/shared/types/rect";
import type { Logger } from "@/main/utils/logger";
import type { IRuntimeContext } from "@/main/application/runtime-context";
import type { ApplicationService } from "../application/application-service";

type WindowContext = {
  logger: Logger;
  runtime: IRuntimeContext;
  appService: ApplicationService;
  bookmarkService: BookmarkService;
  historyService: HistoryService;
  settings: Settings;
  eventBus: EventBus;
  bounds?: Rect;
};

export class Window {
  viewY: number = 66;

  private readonly appService;
  private readonly runtime;
  private readonly logger;
  private readonly win;
  readonly navigation;
  readonly optionMenuController;
  private readonly bookmarkService;
  private readonly historyService;
  private readonly settings;
  private readonly eventBus;

  readonly tabManager: TabManager;

  constructor(context: WindowContext) {
    this.logger = context.logger;
    this.runtime = context.runtime;
    this.appService = context.appService;
    this.bookmarkService = context.bookmarkService;
    this.historyService = context.historyService;
    this.settings = context.settings;
    this.eventBus = context.eventBus;

    this.win = new BaseWindow(this.createWindowConstructorOptions(context.bounds));

    const optionMenuView = new OptionMenuView(this.runtime, this, {
      x: 0,
      y: this.viewY,
      width: context.bounds ? context.bounds.width : this.getBounds().width,
      height: context.bounds ? context.bounds.height : this.getBounds().height,
    });
    this.optionMenuController = new OptionMenuController({
      logger: this.logger,
      appService: this.appService,
      bookmarkService: this.bookmarkService,
      historyService: this.historyService,
      view: optionMenuView,
      window: this,
      fadeTime: 400,
    });

    const tabCollection = new TabCollection();
    this.tabManager = new TabManager({
      logger: this.logger,
      collection: tabCollection,
      settings: this.settings,
      window: this,
      bookmarkService: this.bookmarkService,
      historyService: this.historyService,
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
      title: `${config.name} ${formatVersion(config.version)}`,
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
    const currentTheme = this.settings.themeService.getThemeById(
      this.settings.themeService.getCurrentThemeId()
    );

    if (!currentTheme) throw new Error();

    const navigation = createNavigationFeature(
      this.runtime,
      this,
      {
        viewY: this.viewY,
        themeUrl: currentTheme.url,
        showHomeButton: this.settings.store.get("settings").design.showHomeButton,
      },
      this.appService,
      this.logger,
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
    this.navigation.close();
    this.tabManager.removeAll();
    this.win.close();
  }

  setTitleBarOverlay(options: Electron.TitleBarOverlayOptions) {
    this.win.setTitleBarOverlay(options);
  }

  getNativeWindow(): Electron.BaseWindow {
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
