import { ContextMenuActions } from "@/main/menu/context-menu/controllers/context-menu-controller";

export function createLinkSelectionMenuTemplate(actions: ContextMenuActions): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: "新しいタブで開く",
      click: actions.openInNewTab
    },
    {
      label: "リンクのアドレスをコピー",
      click: actions.copyLinkURL
    },
  ];
}