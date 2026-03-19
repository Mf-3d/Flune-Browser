import { resolveView, ROUTE_MAP } from "@/shared/resolveView";

import type { ActionHandlerMap, MenuActionDescriptor, PayloadOf } from "@/shared/types/menu";
import type { MenuActionContext } from "../templates/types";


const HOME_URL = resolveView(ROUTE_MAP.home);

export function handleAction<T extends MenuActionDescriptor>(
  desc: T,
  context: MenuActionContext
) {
  const handlers: ActionHandlerMap = {
    quit: () => {
      context.appService.quit({
        forced: false,
        window: context.window
      });
    },

    "new-tab": () => {
      context.appService.createTab(context.window);
    },

    "add-bookmark": () => {
      context.appService.addActiveTabToBookmarks(context.window);
    },

    "open-bookmark": (payload) => {
      if (!payload) return;

      const tab = context.appService.createTab(context.window);
      tab.loadURL(context.bookmarkService.getById(payload.id)!.url);
    },

    "open-history": (payload) => {
      if (!payload) return;

      const tab = context.appService.createTab(context.window);
      // tab.loadURL(context.bookmarkService.getById(payload.id)!.url);
    },

    "open-bookmarks-page": () => {
      // context.appService.showSettingsPage(context.window);
    },

    "open-downloads-page": () => {
      // window.tabManager.navigate();
    },

    "open-histories-page": () => {
      // window.tabManager.navigate();
    },

    "open-settings-page": () => {
      context.appService.showSettingsPage(context.window);
    },

    "open-versions-page": () => {
      context.appService.showVersionsPage(context.window);
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

    case "open-histories-page":
      handlers["open-histories-page"](undefined);
      break;

    case "open-versions-page": 
      handlers["open-versions-page"](undefined);
      break;

    case "open-settings-page":
      handlers["open-settings-page"](undefined);
      break;
  }
}

/*
export function createOptionMenuActions(): Record<MenuId, MenuAction> {
  return {
    "new-tab": (context) => {
      const tab = context.appService.createTab(context.window);
      tab.loadURL(HOME_URL);
    },
    "add-bookmark": (context) => {
      // context.appService.addBookmark(context.payload?.url);
    },
    "open-bookmark": (context) => {
      // context.appService.openBookmark(context.payload?.url);
    },
    "open-bookmarks": (context) => {
      // context.appService.showSettingsPage(context.window);
    },
    "open-settings": (context) => {
      context.appService.showSettingsPage(context.window);
    },
    "open-downloads": (context) => {
      // window.tabManager.navigate();
    },
    "open-versions": (context) => {
      context.appService.showVersionsPage(context.window);
    },
    "quit": (context) => {
      context.appService.quit({
        forced: false,
        window: context.window
      });
    }
  };
}
*/