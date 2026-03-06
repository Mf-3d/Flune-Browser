import { IPC_NOTIFY } from "@/shared/ipc/channels";
import { OptionMenuView } from "../view/option-menu-view";

type MenuState =
  | "closed"
  | "opening"
  | "open"
  | "closing";

export class OptionMenuController {
  private state: MenuState = "closed";

  constructor(
    private readonly view: OptionMenuView,
    private readonly fadeTime: number
  ) {
    view.on("close", () => this.close());
  }

  isVisible() {
    return this.view.isVisible();
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
}