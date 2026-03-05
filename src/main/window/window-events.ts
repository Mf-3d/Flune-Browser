import { BaseWindow } from "electron";
import { TabManager } from "./tab";
import { Navigation } from "../navigation/navigation-feature";

export function registerWindowEvents(baseWindow: BaseWindow, navigation: Navigation, tabManager: TabManager) {
  baseWindow.on("resize", () => {
    const bounds = baseWindow.getContentBounds();

    navigation.setWidth(bounds.width);
  });
  baseWindow.on("close", () => {
    navigation.view.webContents.close();
    tabManager.removeAll();
  });
}