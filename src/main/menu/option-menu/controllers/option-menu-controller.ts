import { createOptionMenuActions } from "../actions/option-menu-actions";

import type { OptionMenuView } from "../view/option-menu-view";
import type { Window } from "@/main/window/window";
import type { MenuId } from "../templates/types";

type MenuState =
  | "closed"
  | "opening"
  | "open"
  | "closing";

export class OptionMenuController {
  private state: MenuState = "closed";
  private readonly actions;

  constructor(
    private readonly view: OptionMenuView,
    private readonly window: Window,
    private readonly fadeTime: number,
  ) {
    view.on("close", () => this.close());
    this.actions = createOptionMenuActions(this.window);
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