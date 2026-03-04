import { ContextMenuActions } from "../controllers/context-menu-controller";

export function createVideoSelectionMenuTemplate(actions: ContextMenuActions): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: "ピクチャーインピクチャー",
      click: actions.startPip
    },
  ];
}