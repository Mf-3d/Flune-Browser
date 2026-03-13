import { resolveView, ROUTE_MAP } from "@/shared/resolveView";
import { MenuAction, MenuId } from "../templates/types";

import type { Window } from "@/main/window/window";
import { ApplicationService } from "@/main/application/application-service";

const HOME_URL = resolveView(ROUTE_MAP.home);

export function createOptionMenuActions(appService: ApplicationService, window: Window): Record<MenuId, MenuAction> {
  return {
    "new-tab": () => {
      const tab = appService.createTab(window);
      tab.loadURL(HOME_URL);
    },
    "open-settings": () => {
      appService.showSettingsPage(window);
    },
    "open-downloads": () => {
      // window.tabManager.navigate();
    },
    "open-versions": () => {
      appService.showVersionsPage(window);
    },
    "quit": () => {
      appService.quit({
        forced: false,
        window
      });
    }
  };
}