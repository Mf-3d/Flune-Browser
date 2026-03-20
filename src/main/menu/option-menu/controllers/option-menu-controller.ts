import { setTimeout } from "node:timers/promises";
import { handleAction } from "../actions/option-menu-actions";
import { buildOptionMenuPage } from "../templates/";

import type { OptionMenuView } from "../view/option-menu-view";
import type { Window } from "@/main/window/window";
import type { MenuActionDescriptor, MenuPageId, OptionMenuItem } from "@/shared/types/menu";
import type { ApplicationService } from "@/main/application/application-service";
import type { BookmarkService } from "@/main/bookmark/service";


type OptionMenuControllerOptions = {
  view: OptionMenuView;
  window: Window;
  fadeTime: number;
  appService: ApplicationService;
  bookmarkService: BookmarkService;
};

type MenuState =
  | "closed"
  | "opening"
  | "open"
  | "closing";

export class OptionMenuController {
  private state: MenuState = "closed";
  private desiredState: "open" | "closed" = "closed";
  private readonly view;
  private readonly window;
  private readonly fadeTime;
  private readonly appService;
  private readonly bookmarkService;

  constructor(options: OptionMenuControllerOptions) {
    this.view = options.view;
    this.window = options.window;
    this.fadeTime = options.fadeTime;
    this.appService = options.appService;
    this.bookmarkService = options.bookmarkService;

    this.view.setVisible(false);
  }

  isVisible() {
    return this.view.isVisible();
  }

  handleClick(action: MenuActionDescriptor) {
    handleAction(
      action,
      {
        appService: this.appService,
        bookmarkService: this.bookmarkService,
        window: this.window,
        optionMenuManager: this
      }
    );

    this.close();
  }

  open() {
    this.desiredState = "open";
    this.syncState();
  }

  close() {
    this.desiredState = "closed";
    this.syncState();
  }

  private syncState() {
    if (this.desiredState === "open" && this.state !== "open") this.startOpen();
    if (this.desiredState === "closed" && this.state !== "closed") this.startClose();
  }

  private async startOpen(): Promise<void> {
    if (this.state === "open" || this.state === "opening") {
      return;
    }

    if (this.state === "closing") {
      await setTimeout(this.fadeTime + 100);
    }
    this.state = "opening";

    this.view.show();

    return new Promise((resolve, reject) => {
      this.view.webContents.once("did-finish-load", async () => {
        try {
          this.view.sendOpening();

          await setTimeout(this.fadeTime);

          this.state = "open";

          resolve();
        } catch (err) {
          console.error("Failed to open Option Menu:", err); // ロガーはまだ入れていないので仮

          reject(err);
        }
      });
    });
  }

  private async startClose() {
    if (this.state === "closed" || this.state === "closing") {
      return;
    }

    this.state = "closing";

    this.view.sendClosing();

    await setTimeout(this.fadeTime);

    this.view.hide();

    this.state = "closed";
  }

  toggle() {
    this.desiredState = (this.desiredState === "open") ? "closed" : "open";
    this.syncState();
  }

  getPage(pageId: MenuPageId): OptionMenuItem[] {
    return buildOptionMenuPage(pageId, {
      bookmarks: this.bookmarkService.getAll()
    });
  }
}