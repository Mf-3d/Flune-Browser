import { handleAction } from "../actions/option-menu-actions";
import { buildOptionMenuTemplate } from "../templates/";

import type { OptionMenuView } from "../view/option-menu-view";
import type { Window } from "@/main/window/window";
import type { MenuActionDescriptor, OptionMenuItem } from "@/shared/types/menu";
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
        window: this.window
      }
    );
  }

  async open() {
    if (this.state === "open" || this.state === "opening") {
      return;
    }

    if (this.state === "closing") {
      await new Promise(resolve => {
        setTimeout(resolve, this.fadeTime + 100);
      });
    }
    this.state = "opening";

    this.view.show();

    await this.view.openAnimation(this.buildMenuTemplate());

    await new Promise(resolve => {
      setTimeout(resolve, this.fadeTime);
    });

    this.state = "open";
  }

  async close() {
    if (this.state === "closed" || this.state === "closing") {
      return;
    }

    this.state = "closing";
    
    await this.view.closeAnimation();

    await new Promise(resolve => {
      setTimeout(resolve, this.fadeTime);
    });

    this.view.hide();

    this.state = "closed";
  }

  async toggle() {
    if (this.state === "open" || this.state === "opening") {
      await this.close();
    } else {
      await this.open();
    }
  }

  buildMenuTemplate(): OptionMenuItem[] {
    return buildOptionMenuTemplate({
      bookmarks: this.bookmarkService.getAll()
    });
  }
}