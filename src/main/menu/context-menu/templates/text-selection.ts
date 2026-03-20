import { ContextMenuActions } from "@/main/menu/context-menu/controllers/context-menu-controller";

export function createTextSelectionMenuTemplate(
  selectionText: string,
  actions: ContextMenuActions
): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: "コピー",
      role: "copy",
      enabled: selectionText !== "",
    },
    {
      label: `「${selectionText}」を検索`,
      click: actions.searchSelectionText,
    },
  ];
}
