import type { ContextMenuActions } from "../types/actions";

export function createEmojiMenuTemplate(
  actions: ContextMenuActions
): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: "絵文字",
      accelerator: process.platform === "win32" ? "Super+." : undefined,
      click: actions.showEmojiPanel,
    },
  ];
}
