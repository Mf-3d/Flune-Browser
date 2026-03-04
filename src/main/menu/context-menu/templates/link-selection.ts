import { ContextMenuActions } from "../controllers/context-menu-controller";

export function createLinkSelectionMenuTemplate(actions: ContextMenuActions): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: "新しいタブで開く",
      // click: () => {
      //   this.base.tabManager?.newTab(state.params.linkURL);
      // }
      click: actions.newTab
    },
    {
      label: "リンクのアドレスをコピー",
      // click() {
      //   clipboard.writeText(state.params.linkURL);
      // }
      click: actions.copyLinkURL
    },
  ];
}