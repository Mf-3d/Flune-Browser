import { shell } from "electron";
import { Window } from "./window";
import { ApplicationMenuController } from "@/main/menu/application-menu/controllers/application-menu-controller";

import type { Settings } from "@/main/settings/";
import type { ApplicationService } from "@/main/application/application-service";
import type { EventBus } from "../infrastructure/event/event-bus";
import type { BookmarkService } from "../bookmark/service";
import type { HistoryService } from "../history/service";

export class WindowManager {
  private baseWindow: Window | undefined;

  constructor(
    private readonly appService: ApplicationService,
    private readonly bookmarkService: BookmarkService,
    private readonly historyService: HistoryService,
    private readonly settings: Settings,
    private readonly eventBus: EventBus
  ) {}

  create() {
    this.baseWindow = new Window({
      appService: this.appService,
      bookmarkService: this.bookmarkService,
      historyService: this.historyService,
      settings: this.settings,
      eventBus: this.eventBus,
    });

    this.eventBus.once("navigation:init", () => {
      this.baseWindow?.tabManager.createTab({
        isActive: true,
      });
    });

    if (!this.appService.isPackaged)
      this.baseWindow.navigation?.view.webContents.openDevTools({
        mode: "detach",
      });

    this.initializeControllers();

    return this.baseWindow;
  }

  ensure() {
    if (!this.baseWindow || this.baseWindow.isDestroyed())
      this.baseWindow = this.create();

    return this.baseWindow;
  }

  getWindowFromWebContents(webContents: Electron.WebContents): Window | undefined {
    // for (const window of this.windows.values()) {
    //   if (window.containsWebContents(webContents)) {
    //     return window;
    //   }
    // }

    return this.baseWindow;
  }

  private initializeControllers() {
    this.setupApplicationMenu();
    // this.setupTabs();
  }

  private setupApplicationMenu() {
    const applicationMenuController = new ApplicationMenuController(this.appService, {
      newTab: () => this.baseWindow?.tabManager.createTab(),
      reloadTab: () => this.baseWindow?.tabManager.getActiveTab()?.reload(),
      reloadTabIgnoringCache: () =>
        this.baseWindow?.tabManager.getActiveTab()?.reload({
          ignoreCache: true,
        }),
      toggleDevTools: () =>
        this.baseWindow?.tabManager.getActiveTab()?.toggleDevTools({
          mode: "right",
        }),
      focusSearchBar: () => {
        this.baseWindow?.navigation?.view.webContents.focus();
        this.baseWindow?.navigation?.view.webContents.send("flune.focus-search-bar");
      },
      reportIssue: () =>
        shell.openExternal(`https://github.com/Mf-3d/${this.appService.name}/issues/new`),
    });

    applicationMenuController.setup();
  }
}
