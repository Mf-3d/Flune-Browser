import type { ContextMenuActions } from "../types/actions";

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
