import { OptionMenuController } from "../controllers/option-menu-controller";
import { OptionMenuView } from "../view/option-menu-view";
import { Window } from "@/main/window/window";

export class OptionMenuFeature {
  private readonly fadeTime: number = 400;
  private readonly view: OptionMenuView;

  constructor(private readonly window: Window) {
    this.view = new OptionMenuView(this.window);
  }

  create() {
    return new OptionMenuController(this.view, this.window, this.fadeTime);
  }
}