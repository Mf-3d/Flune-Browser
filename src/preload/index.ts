import { contextBridge } from "electron";

import { isNavigationPage, NAVIGATION } from "./api/navigation";
import { DEFAULT } from "./api/default";
import { isSettingsPage, SETTINGS } from "./api/settings";
import { isMenuPage, MENU } from "./api/menu";
import { BROWSER, isBrowserPage } from "./api/browser";

import type { API } from "@/shared/types/preload-api";

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
