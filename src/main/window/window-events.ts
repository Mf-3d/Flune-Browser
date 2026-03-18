import type { BaseWindow } from "electron";
import type { Navigation } from "../navigation/navigation-feature";
import type { Settings } from "@/main/settings";
import type { TabManager } from "@/main/tab/tab-manager";
import type { EventBus } from "../infrastructure/event/event-bus";

export function registerWindowEvents(baseWindow: BaseWindow, navigation: Navigation, tabManager: TabManager, eventBus: EventBus, settings: Settings) {
  baseWindow.on("resize", () => {
    const bounds = baseWindow.getContentBounds();

    navigation.setWidth(bounds.width);
  });
  baseWindow.on("close", () => {
    navigation.view.webContents.close();
    tabManager.removeAll();
  });
  eventBus.on("theme:updated", (payload) => {
    const theme = settings.themeService.getThemeById(payload.themeId);

    if (!theme) {
      throw new Error("Theme does not exist.");
    }

    navigation.updateTheme(theme?.url);
  });
  eventBus.on("settings:updated", () => {
    navigation.updateState({
      showHomeButton: settings.store.get("settings").design.showHomeButton
    });
  });
}