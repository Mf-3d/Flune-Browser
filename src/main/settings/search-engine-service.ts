import type { SettingsStore } from "@/main/infrastructure/storage/settings-store";
import type { SearchEngine } from "@/shared/types/config";
import type { Logger } from "../utils/logger";

export class SearchEngineService {
  constructor(
    private readonly store: SettingsStore,
    private readonly logger: Logger
  ) {}

  getCurrentSearchEngineId(): string {
    return this.store.get("settings").search.engine;
  }

  getEngines(): SearchEngine[] {
    return this.store.get("searchEngines");
  }

  getEngineById(id: string): SearchEngine | undefined {
    const engines = this.getEngines();
    const engine = engines.find((engine) => engine.id === id);

    if (!engine) {
      this.logger.warn(`Theme not found: ${id}, falling back to default`);
      return engines[0]; // 0番目をデフォルトに
    }

    return engine;
  }
}
