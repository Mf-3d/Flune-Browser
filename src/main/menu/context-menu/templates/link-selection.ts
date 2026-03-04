import { ContextMenuActions } from "../controllers/context-menu-controller";

export function createLinkSelectionMenuTemplate(actions: ContextMenuActions): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: "新しいタブで開く",
      click: actions.newTab
    },
    {
      label: "リンクのアドレスをコピー",
      click: actions.copyLinkURL
    },
  ];
}