import { app, Menu, shell } from "electron";
import { Base } from "./base-window";
import Event from "@/main/lib/event";
import { DataManager } from "../lib/data";
import { BookmarkService } from "../bookmark/service";
import { ContextMenuManager } from "@/main/menu/context-menu";
import { ContextMenuController } from "@/main/menu/contextMenuController";
import { OptionMenuManager } from "@/main/menu/option-menu";
import { ApplicationMenuController } from "../menu/application-menu/controllers/application-menu-controller";

export class WindowManager {
  private baseWindow: Base | undefined;

  create(bookmarkService: BookmarkService, event: Event, data: DataManager) {
    this.baseWindow = new Base(bookmarkService, data);

    event.once("navigation-loaded", () => {
      this.baseWindow?.tabManager.newTab();
    });

    if (!app.isPackaged) this.baseWindow.nav.webContents.openDevTools({
      mode: "detach"
    });

    this.initializeControllers();

    return this.baseWindow;
  }

  ensure(bookmarkService: BookmarkService, event: Event, data: DataManager) {
    if (!this.baseWindow || this.baseWindow?.win.isDestroyed())
      this.baseWindow = this.create(bookmarkService, event, data);

    return this.baseWindow;
  }

  private initializeControllers() {
    this.setupApplicationMenu();
    // this.setupContextMenu();
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
        this.baseWindow?.nav.webContents.focus();
        this.baseWindow?.nav.webContents.send("flune.focus-search-bar");
      },
      reportIssue: () => shell.openExternal(`https://github.com/Mf-3d/${app.name}/issues/new`)
    });

    applicationMenuController.setup();
  }
}