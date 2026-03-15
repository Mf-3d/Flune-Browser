import { OptionMenuController } from "../controllers/option-menu-controller";
import { OptionMenuView } from "../view/option-menu-view";

import type { ApplicationService } from "@/main/application/application-service";
import type { Window } from "@/main/window/window";

export class OptionMenuFeature {
  private readonly fadeTime: number = 400;
  private readonly view: OptionMenuView;

  constructor(
    private readonly appService: ApplicationService,
    private readonly window: Window
  ) {
    this.view = new OptionMenuView(this.appService, this.window);
  }

  create() {
    return new OptionMenuController({
      view: this.view,
      window: this.window,
      fadeTime: this.fadeTime,
      appService: this.appService
    });
  }
}