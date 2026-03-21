import { ContextMenuActions } from "@/main/menu/context-menu/controllers/context-menu-controller";

export function createVideoSelectionMenuTemplate(
  actions: ContextMenuActions
): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: "ピクチャーインピクチャー",
      click: actions.startPip,
    },
  ];
}
