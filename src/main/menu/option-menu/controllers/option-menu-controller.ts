import { handleAction } from "../actions/option-menu-actions";
import { buildOptionMenuPage } from "../templates/";

import type { OptionMenuView } from "../view/option-menu-view";
import type { Window } from "@/main/window/window";
import type { MenuActionDescriptor, MenuPageId, OptionMenuItem } from "@/shared/types/menu";
import type { ApplicationService } from "@/main/application/application-service";
import type { BookmarkService } from "@/main/bookmark/service";
import { wait } from "@/main/utils/wait";


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
  private eventTimeout?: NodeJS.Timeout;
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
    if (this.eventTimeout) clearTimeout(this.eventTimeout);
    this.desiredState = "open";

    this.eventTimeout = setTimeout(() => {
      this.eventTimeout = undefined;
      this.syncState();
    }, 10);
  }

  close() {
    if (this.eventTimeout) clearTimeout(this.eventTimeout);
    this.desiredState = "closed";

    this.eventTimeout = setTimeout(() => {
      this.eventTimeout = undefined;
      this.syncState();
    }, 10);
  }

  toggle() {
    if (this.eventTimeout) clearTimeout(this.eventTimeout);
    this.desiredState = (this.desiredState === "open" && this.state === "open") ? "closed" : "open";

    this.eventTimeout = setTimeout(() => {
      this.eventTimeout = undefined;
      this.syncState();
    }, 10);
  }

  private syncState() {
    if (this.desiredState === "open" && this.state !== "open") this.startOpen();
    if (this.desiredState === "closed" && this.state !== "closed") this.startClose();
  }

  private async startOpen(retry: boolean = false): Promise<void> {
    if (this.state === "open" || this.state === "opening") {
      return;
    }

    if (this.state === "closing") {
      if (retry) await wait(this.fadeTime + 100);
      else return;
    }
    
    this.state = "opening";

    this.view.show();

    return new Promise((resolve, reject) => {
      this.view.webContents.once("did-finish-load", async () => {
        try {
          this.view.sendOpening();

          await wait(this.fadeTime);

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

    await wait(this.fadeTime);

    this.view.hide();

    this.state = "closed";
  }

  getPage(pageId: MenuPageId): OptionMenuItem[] {
    return buildOptionMenuPage(pageId, {
      bookmarks: this.bookmarkService.getAll()
    });
  }
}