import { contextBridge } from "electron";
import { NAVIGATION } from "./navigation";
import { DEFAULT } from "./default";
import { isSettingsPage, SETTINGS } from "./settings";
import { MENU } from "./menu";

const api: any = DEFAULT;

api.navigation = NAVIGATION;
api.menu = MENU;

if (isSettingsPage()) {
  api.settings = SETTINGS;
}

contextBridge.exposeInMainWorld("flune", api);