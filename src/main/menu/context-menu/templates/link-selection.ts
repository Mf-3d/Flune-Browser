import type { ContextMenuActions } from "../types/actions";

export function createLinkSelectionMenuTemplate(
  actions: ContextMenuActions
): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: "新しいタブで開く",
      click: actions.openInNewTab,
    },
    {
      label: "リンクのアドレスをコピー",
      click: actions.copyLinkURL,
    },
  ];
}
