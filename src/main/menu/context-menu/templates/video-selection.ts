import { ContextMenuActions } from "../controllers/context-menu-controller";

export function createVideoSelectionMenuTemplate(actions: ContextMenuActions): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: "ピクチャーインピクチャー",
      // click: () => {
      //   this.base.tabManager?.getActiveTabCurrent()?.entity.webContents.executeJavaScript(`(document.activeElement.tagName === "video") ? document.activeElement.requestPictureInPicture() : document.activeElement.querySelector("video").requestPictureInPicture();`);
      // }
      click: actions.startPip
    },
  ];
}