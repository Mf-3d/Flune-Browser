import { app, shell } from "electron";
import { Base } from "./base-window";
import Event from "@/main/lib/event";
import { DataManager } from "../lib/data";
import { ApplicationMenuController } from "@/main/menu/application-menu/controllers/application-menu-controller";
import { ContextMenuController } from "../menu/context-menu/controllers/context-menu-controller";
import { Settings } from "@/main/settings/";

export class WindowManager {
  private baseWindow: Base | undefined;

  constructor (private readonly settings: Settings) { }

  create(event: Event, data: DataManager) {
    this.baseWindow = new Base(data, this.settings, event);

    event.once("navigation-loaded", () => {
      this.baseWindow?.tabManager.newTab(undefined, {
        active: true
      });
    });

    if (!app.isPackaged) this.baseWindow.navigation?.view.webContents.openDevTools({
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

  private initializeControllers() {
    this.setupApplicationMenu();
    this.setupContextMenu();
    // this.setupTabs();
  }

  private setupApplicationMenu() {
    const applicationMenuController = new ApplicationMenuController({
      newTab: () => this.baseWindow?.tabManager.newTab(),
      reloadTab: () => this.baseWindow?.tabManager.reloadTab(),
      reloadTabIgnoringCache: () => this.baseWindow?.tabManager.reloadTab(undefined, true),
      toggleDevTools: () => this.baseWindow?.tabManager.toggleDevTools(undefined, {
        mode: "right"
      }),
      focusSearchBar: () => {
        this.baseWindow?.navigation?.view.webContents.focus();
        this.baseWindow?.navigation?.view.webContents.send("flune.focus-search-bar");
      },
      reportIssue: () => shell.openExternal(`https://github.com/Mf-3d/${app.name}/issues/new`)
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