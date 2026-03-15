import type { BaseWindow } from "electron";
import type { Navigation } from "../navigation/navigation-feature";
import type Event from "../lib/event";
import type { Settings } from "@/main/settings";
import type { TabManager } from "@/main/tab/tab-manager";

export function registerWindowEvents(baseWindow: BaseWindow, navigation: Navigation, tabManager: TabManager, event: Event, settings: Settings) {
  baseWindow.on("resize", () => {
    const bounds = baseWindow.getContentBounds();

    navigation.setWidth(bounds.width);
  });
  baseWindow.on("close", () => {
    navigation.view.webContents.close();
    tabManager.removeAll();
  });
  event.on("theme-updated", (id) => {
    navigation.updateTheme(id);
  });
  event.on("setting-updated", () => {
    navigation.updateState({
      showHomeButton: settings.store.get("settings").design.showHomeButton
    });
  });
}