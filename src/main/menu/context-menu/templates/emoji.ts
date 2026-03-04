import { ContextMenuActions } from "../controllers/context-menu-controller";

export function createEmojiMenuTemplate(actions: ContextMenuActions): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: "絵文字",
      accelerator: process.platform === "win32" ? "Super+." : undefined,
      // click: () => {
      //   app.showEmojiPanel();
      // }
      click: actions.showEmojiPanel
    },
  ];
}