import { app, Menu } from "electron";
import { ApplicationMenuActions, createAppMenuTemplate } from "@/main/menu/application-menu/templates/application-menu";

export class ApplicationMenuController {
  constructor(
    private readonly actions: ApplicationMenuActions
  ) { }

  setup() {
    const template = createAppMenuTemplate(app.name, this.actions);
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
}