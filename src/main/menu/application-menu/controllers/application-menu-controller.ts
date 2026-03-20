import { Menu } from "electron";
import { createAppMenuTemplate } from "@/main/menu/application-menu/templates/application-menu";

import type { ApplicationMenuActions } from "@/main/menu/application-menu/templates/application-menu";
import type { ApplicationService } from "@/main/application/application-service";

export class ApplicationMenuController {
  constructor(
    private readonly appService: ApplicationService,
    private readonly actions: ApplicationMenuActions
  ) {}

  setup() {
    const template = createAppMenuTemplate(this.appService.name, this.actions);
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
}
