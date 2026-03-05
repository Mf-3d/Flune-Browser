import { contextBridge } from "electron";
import { isNavigationPage, NAVIGATION } from "./navigation";
import { DEFAULT } from "./default";
import { isSettingsPage, SETTINGS } from "./settings";
import { MENU } from "./menu";
import { API } from "../shared/types/preload-api";

const api: API = DEFAULT;

if (isNavigationPage()) {
  api.navigation = NAVIGATION;
}

api.menu = MENU;

if (isSettingsPage()) {
  api.settings = SETTINGS;
}

contextBridge.exposeInMainWorld("flune", api);