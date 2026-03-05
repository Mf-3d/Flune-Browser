import fs from "fs";
import path from "path";
import Store from "electron-store";
import { SettingsStore } from "./settings-store";
import { ThemeService } from "./theme-service";
import Event from "@/main/lib/event";
import { SearchEngineService } from "./search-engine-service";
import { registerSettingsHandler } from "../ipc/settings-handler";

export type Settings = ReturnType<typeof createSettings>;

const DEFAULT_CONFIG_PATH = path.join(__dirname, "..", "..", "assets", "store", "default", "config-3.json");

export function createSettings(event: Event) {
  const DEFAULT_CONFIG = JSON.parse(fs.readFileSync(DEFAULT_CONFIG_PATH, {
    encoding: "utf-8"
  }));

  const config = new Store({
    defaults: DEFAULT_CONFIG
  });
  config.store

  const store = new SettingsStore(config);
  const searchEngineService = new SearchEngineService(store);
  const themeService = new ThemeService(store);

  registerSettingsHandler(store, event);
  return {
    store,
    themeService,
    searchEngineService,
  };
}