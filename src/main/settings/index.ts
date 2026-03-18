import fs from "fs";
import path from "path";
import Store from "electron-store";
import { SettingsStore } from "./settings-store";
import { ThemeService } from "./theme-service";
import { SearchEngineService } from "./search-engine-service";

export type Settings = ReturnType<typeof createSettings>;

const DEFAULT_CONFIG_PATH = path.join(__dirname, "..", "..", "assets", "store", "default", "config-3.json");

export function createSettings() {
  const DEFAULT_CONFIG = JSON.parse(fs.readFileSync(DEFAULT_CONFIG_PATH, {
    encoding: "utf-8"
  }));

  const config = new Store({
    name: "config-3",
    defaults: DEFAULT_CONFIG
  });

  const store = new SettingsStore(config);
  const searchEngineService = new SearchEngineService(store);
  const themeService = new ThemeService(store);

  return {
    store,
    themeService,
    searchEngineService,
  };
}