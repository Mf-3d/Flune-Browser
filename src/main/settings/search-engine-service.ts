import type { SettingsStore } from "@/main/infrastructure/storage/settings-store";
import type { SearchEngine } from "@/shared/types/config";

export class SearchEngineService {
  constructor(private store: SettingsStore) { }

  getCurrentSearchEngineId(): string {
    return this.store.get("settings").search.engine;
  }

  getEngines(): SearchEngine[] {
    return this.store.get("searchEngines");
  }
  
  getEngineById(id: string): SearchEngine | undefined {
    const engines = this.getEngines();
    const engine = engines.find(engine => engine.id === id);
  
    if (!engine) {
      console.warn(`Theme not found: ${id}, falling back to default`);
      return engines[0]; // 0番目をデフォルトに
    }
  
    return engine;
  }
}