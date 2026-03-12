import { BaseWindow } from "electron";
// import { TabManager } from "./tab";
import { Navigation } from "../navigation/navigation-feature";
import Event from "../lib/event";
import { IPC_NOTIFY } from "@/shared/ipc/channels";
import { Settings } from "@/main/settings";
import { TabManager } from "@/main/tab/tab-manager";

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
    navigation.send(IPC_NOTIFY.NAVIGATION_UPDATE, {
      showHomeButton: settings.store.get("settings").design.showHomeButton
    });
  });
}