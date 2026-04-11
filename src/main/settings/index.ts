import { SettingsStore } from "@/main/infrastructure/storage/settings-store";
import { ThemeService } from "./theme-service";
import { SearchEngineService } from "./search-engine-service";

import type { Logger } from "@/main/utils/logger";
import type { IRuntimeContext } from "../application/runtime-context";

export type Settings = ReturnType<typeof createSettings>;

export function createSettings(runtime: IRuntimeContext, logger: Logger) {
  const store = new SettingsStore();
  const searchEngineService = new SearchEngineService(store, logger);
  const themeService = new ThemeService(store, runtime, logger);

  return {
    store,
    themeService,
    searchEngineService,
  };
}
