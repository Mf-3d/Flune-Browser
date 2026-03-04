import { ContextMenuActions } from "../controllers/context-menu-controller";

export function createTextSelectionMenuTemplate(selectionText: string, actions: ContextMenuActions): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: "コピー",
      role: "copy",
      enabled: selectionText !== ""
    },
    {
      label: `「${selectionText}」を検索`,
      // click: () => {
      //   this.base.tabManager?.newTab(state.params.selectionText, {
      //     active: true
      //   })
      // }
      click: actions.searchSelectionText,
    },
  ];
}