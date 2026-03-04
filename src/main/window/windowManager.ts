import { app } from "electron";
import { Base } from "./base-window";
import Event from "@/main/lib/event";
import { DataManager } from "../lib/data";
import { BookmarkService } from "../bookmark/service";

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

    return this.baseWindow;
  }

  ensure(bookmarkService: BookmarkService, event: Event, data: DataManager) {
    if (this.baseWindow?.win.isDestroyed())
      this.baseWindow = this.create(bookmarkService, event, data);
  }
}