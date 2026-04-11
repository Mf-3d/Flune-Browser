import path from "node:path";
import { dialog, shell } from "electron";
import { Window } from "./window";
import { ApplicationMenuController } from "@/main/menu/application-menu/controllers/application-menu-controller";
import { config } from "@/app.config";

import type { Settings } from "@/main/settings/";
import type { EventBus } from "@/main/infrastructure/event/event-bus";
import type { BookmarkService } from "@/main/bookmark/service";
import type { HistoryService } from "@/main/history/service";
import type { Logger } from "@/main/utils/logger";
import type { IRuntimeContext } from "../application/runtime-context";

export class WindowManager {
  private baseWindow: Window | undefined;

  constructor(
    private readonly logger: Logger,
    private readonly runtime: IRuntimeContext,
    private readonly bookmarkService: BookmarkService,
    private readonly historyService: HistoryService,
    private readonly settings: Settings,
    private readonly eventBus: EventBus
  ) {}

  create() {
    this.baseWindow = new Window({
      logger: this.logger,
      runtime: this.runtime,
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

    if (!this.runtime.isPackaged)
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
    const applicationMenuController = new ApplicationMenuController({
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
      reportIssue: () => {
        if (config.github) shell.openExternal(path.join(config.github, "/issues/new"));
        else {
          dialog.showMessageBoxSync({
            type: "error",
            title: "The external link could not be opened.",
            message: "GitHub repository URL is not set.",
          });
          throw new Error("GitHub repository URL is not set.");
        }
      },
    });

    applicationMenuController.setup();
  }
}
