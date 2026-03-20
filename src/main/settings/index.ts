import { SettingsStore } from "@/main/infrastructure/storage/settings-store";
import { ThemeService } from "./theme-service";
import { SearchEngineService } from "./search-engine-service";

import type { ApplicationService } from "@/main/application/application-service";


export type Settings = ReturnType<typeof createSettings>;

export function createSettings(appService: ApplicationService) {
  const store = new SettingsStore();
  const searchEngineService = new SearchEngineService(store);
  const themeService = new ThemeService(store, appService);

  return {
    store,
    themeService,
    searchEngineService,
  };
}