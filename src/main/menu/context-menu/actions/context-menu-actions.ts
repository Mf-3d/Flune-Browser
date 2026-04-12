import { app, clipboard } from "electron";
import { resolveView, ROUTE_MAP } from "@/shared/resolveView";

import type { ContextMenuActions } from "../types/actions";
import type { Window } from "@/main/window/window";

type ActionsContext = {
  window: Window;
};

export function createActions(
  context: ActionsContext,
  params: Electron.ContextMenuParams
): ContextMenuActions {
  return {
    showEmojiPanel: () => app.showEmojiPanel(),
    openInNewTab: () =>
      context.window.tabManager.createTab({
        input: params.linkURL,
        isActive: true,
      }),
    copyLinkURL: () => {
      clipboard.writeText(params.linkURL);
    },
    toggleNavigationDevTools: () =>
      context.window.navigation.view.webContents.toggleDevTools(),
    toggleDevTools: () => context.window.tabManager.getActiveTab()?.toggleDevTools(),
    openSettings: () =>
      context.window.tabManager.navigate(resolveView(ROUTE_MAP.settings)),
    searchSelectionText: () =>
      context.window.tabManager.createTab({
        input: params.selectionText,
        isActive: true,
      }),
    startPip: () =>
      context.window.tabManager
        .getActiveTab()
        ?.webContents.executeJavaScript(
          `(document.activeElement.tagName === "video") ? document.activeElement.requestPictureInPicture() : document.activeElement.querySelector("video").requestPictureInPicture();`
        ),
    goBack: () => context.window.tabManager.getActiveTab()?.goBack(),
    goForward: () => context.window.tabManager.getActiveTab()?.goForward(),
    reloadTab: () => context.window.tabManager.getActiveTab()?.reload(),
    viewSource: () =>
      context.window.tabManager?.createTab({
        input: `view-source:${context.window.tabManager.getActiveTab()?.url}`,
        isActive: true,
      }),
  };
}
