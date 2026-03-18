import { resolveView, ROUTE_MAP } from "@/shared/resolveView";

import type{ MenuActionDescriptor } from "@/shared/types/menu";
import type { MenuAction, MenuActionContext } from "../templates/types";


const HOME_URL = resolveView(ROUTE_MAP.home);

export function handleAction(
  action: MenuActionDescriptor,
  context: MenuActionContext
) {
  switch (action.type) {
    case "new-tab": {
      context.appService.createTab(context.window);
      return;
    }

    case "open-bookmark": {
      const tab = context.appService.createTab(context.window);
      // tab.loadURL(getBookmark(context.id).url);
      return;
    }

    case "open-bookmarks-page": {
      // context.appService.showSettingsPage(context.window);
    }

    case "open-downloads-page": {
      // window.tabManager.navigate();
    }

    case "open-settings-page": {
      context.appService.showSettingsPage(context.window);
    }

    case "open-versions-page": {
      context.appService.showVersionsPage(context.window);
    }

    case "quit": {
      context.appService.quit({
        forced: false,
        window: context.window
      });
    }
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