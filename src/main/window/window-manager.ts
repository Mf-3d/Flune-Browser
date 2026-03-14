import { shell } from "electron";
import { Window } from "./window";
import { ApplicationMenuController } from "@/main/menu/application-menu/controllers/application-menu-controller";
import { ContextMenuController } from "@/main/menu/context-menu/controllers/context-menu-controller";

import type { DataManager } from "../lib/data";
import type Event from "@/main/lib/event";
import type { Settings } from "@/main/settings/";
import type { ApplicationService } from "../application/application-service";

export class WindowManager {
  private baseWindow: Window | undefined;

  constructor(
    private readonly appService: ApplicationService,
    private readonly settings: Settings,
  ) { }

  create(event: Event, data: DataManager) {
    this.baseWindow = new Window({
      appService: this.appService,
      data,
      settings: this.settings,
      event,
    });

    event.once("navigation-loaded", () => {
      this.baseWindow?.tabManager.createTab({
        isActive: true
      });
    });

    if (!this.appService.isPackaged) this.baseWindow.navigation?.view.webContents.openDevTools({
      mode: "detach"
    });

    this.initializeControllers();

    return this.baseWindow;
  }

  ensure(event: Event, data: DataManager) {
    if (!this.baseWindow || this.baseWindow?.win?.isDestroyed())
      this.baseWindow = this.create(event, data);

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
    this.setupContextMenu();
    // this.setupTabs();
  }

  private setupApplicationMenu() {
    const applicationMenuController = new ApplicationMenuController({
      newTab: () => this.baseWindow?.tabManager.createTab(),
      reloadTab: () => this.baseWindow?.tabManager.getActiveTab()?.reload(),
      reloadTabIgnoringCache: () => this.baseWindow?.tabManager.getActiveTab()?.reload({
        ignoreCache: true
      }),
      toggleDevTools: () => this.baseWindow?.tabManager.getActiveTab()?.toggleDevTools({
        mode: "right"
      }),
      focusSearchBar: () => {
        this.baseWindow?.navigation?.view.webContents.focus();
        this.baseWindow?.navigation?.view.webContents.send("flune.focus-search-bar");
      },
      reportIssue: () => shell.openExternal(`https://github.com/Mf-3d/${this.appService.name}/issues/new`)
    });

    applicationMenuController.setup();
  }

  private setupContextMenu() {
    if (!this.baseWindow || !this.baseWindow.navigation) return;

    const contextMenuController = new ContextMenuController(this.baseWindow);
    contextMenuController.register(this.baseWindow.navigation.view.webContents, {
      area: "navigation"
    });
  }
}