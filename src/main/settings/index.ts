import { SettingsStore } from "@/main/infrastructure/storage/settings-store";
import { ThemeService } from "./theme-service";
import { SearchEngineService } from "./search-engine-service";

import type { ApplicationService } from "@/main/application/application-service";
import type { Logger } from "@/main/utils/logger";

export type Settings = ReturnType<typeof createSettings>;

export function createSettings(appService: ApplicationService, logger: Logger) {
  const store = new SettingsStore();
  const searchEngineService = new SearchEngineService(store, logger);
  const themeService = new ThemeService(store, appService, logger);

  return {
    store,
    themeService,
    searchEngineService,
  };
}
