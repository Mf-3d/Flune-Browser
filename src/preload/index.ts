import { contextBridge } from "electron";
import { isNavigationPage, NAVIGATION } from "./navigation";
import { DEFAULT } from "./default";
import { isSettingsPage, SETTINGS } from "./settings";
import { isMenuPage, MENU } from "./menu";
import { API } from "../shared/types/preload-api";
import { BROWSER, isBrowserPage } from "./browser";

const api: API = DEFAULT;

if (isNavigationPage()) {
  api.navigation = NAVIGATION;
}

if (isMenuPage()) {
  api.menu = MENU;
} 

if (isSettingsPage()) {
  api.settings = SETTINGS;
}

if (isBrowserPage()) {
  api.browser = BROWSER;
}

contextBridge.exposeInMainWorld("flune", api);