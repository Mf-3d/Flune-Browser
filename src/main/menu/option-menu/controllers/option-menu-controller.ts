import { createOptionMenuActions } from "../actions/option-menu-actions";

import type { OptionMenuView } from "../view/option-menu-view";
import type { Window } from "@/main/window/window";
import type { MenuId } from "../templates/types";
import type { ApplicationService } from "@/main/application/application-service";

type OptionMenuControllerOptions = {
  view: OptionMenuView;
  window: Window;
  fadeTime: number;
  appService: ApplicationService;
};

type MenuState =
  | "closed"
  | "opening"
  | "open"
  | "closing";

export class OptionMenuController {
  private state: MenuState = "closed";
  private readonly actions;
  private readonly view;
  private readonly window;
  private readonly fadeTime;
  private readonly appService;

  constructor(options: OptionMenuControllerOptions) {
    this.view = options.view;
    this.window = options.window;
    this.fadeTime = options.fadeTime;
    this.appService = options.appService;

    this.actions = createOptionMenuActions(this.appService, this.window);

    this.view.setVisible(false);
  }

  isVisible() {
    return this.view.isVisible();
  }

  handleClick(id: MenuId) {
    const action = this.actions[id];
    action?.();
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

    await this.view.openAnimation();

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
}