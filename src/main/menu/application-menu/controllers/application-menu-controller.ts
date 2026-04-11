import { Menu } from "electron";
import { createAppMenuTemplate } from "@/main/menu/application-menu/templates/application-menu";
import { config } from "@/app.config";

import type { ApplicationMenuActions } from "@/main/menu/application-menu/templates/application-menu";
export class ApplicationMenuController {
  constructor(private readonly actions: ApplicationMenuActions) {}

  setup() {
    const template = createAppMenuTemplate(config.name, this.actions);
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
}
