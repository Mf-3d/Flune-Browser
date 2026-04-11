import { resolveView, ROUTE_MAP } from "@/shared/resolveView";

import type { ActionHandlerMap, MenuActionDescriptor } from "@/shared/types/menu";
import type { MenuActionContext } from "../templates/types";

export function handleAction<T extends MenuActionDescriptor>(
  desc: T,
  context: MenuActionContext
) {
  const handlers: ActionHandlerMap = {
    quit: () => {
      context.appService.quit({
        forced: false,
        window: context.window,
      });
    },

    "new-tab": () => {
      context.window.tabManager.createTab({
        isActive: true,
      });
    },

    "add-bookmark": () => {
      const tab = context.window.tabManager.getActiveTab();

      if (!tab) {
        throw new Error("Tab does not exist.");
      }

      if (!tab.url) {
        throw new Error(`Tab (${tab.id}) does not have URL.`);
      }
      
      context.bookmarkService.add({
        title: tab.title,
        url: tab.url.toString(),
      });
    },

    "open-bookmark": (payload) => {
      if (!payload) return;

      const bookmark = context.bookmarkService.getBookmarkById(payload.id);

      if (!bookmark) {
        throw new Error(`Bookmark ${payload.id} does not exist.`);
      }

      context.window.tabManager.navigate(bookmark.url);
    },

    "open-bookmark-folder": (payload) => {
      //
    },

    "open-history": (payload) => {
      if (!payload) return;

      const historyItem = context.historyService.getById(payload.id);

      if (!historyItem) {
        throw new Error(`History (${payload.id}) does not exist.`);
      }

      context.window.tabManager.navigate(historyItem.url);
    },

    "open-bookmarks-page": () => {
      // context.appService.showSettingsPage(context.window);
    },

    "open-downloads-page": () => {
      // window.tabManager.navigate();
    },

    "open-history-page": () => {
      // window.tabManager.navigate();
    },

    "open-settings-page": () => {
      context.window.tabManager.navigate(resolveView(ROUTE_MAP.settings));
    },

    "open-versions-page": () => {
      context.window.tabManager.navigate(resolveView(ROUTE_MAP.version));
    },
  };

  switch (desc.type) {
    case "quit":
      handlers.quit(undefined);
      break;

    case "add-bookmark":
      handlers["add-bookmark"](undefined);
      break;

    case "new-tab":
      handlers["new-tab"](undefined);
      break;

    case "open-bookmark":
      handlers["open-bookmark"](desc.payload);
      break;

    case "open-history":
      handlers["open-history"](desc.payload);
      break;

    case "open-bookmarks-page":
      handlers["open-bookmarks-page"](undefined);
      break;

    case "open-downloads-page":
      handlers["open-downloads-page"](undefined);
      break;

    case "open-history-page":
      handlers["open-history-page"](undefined);
      break;

    case "open-versions-page":
      handlers["open-versions-page"](undefined);
      break;

    case "open-settings-page":
      handlers["open-settings-page"](undefined);
      break;
  }
}
