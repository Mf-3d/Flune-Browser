import type { Config } from "@/shared/types/config";
import type { Path, PathValue } from "@/shared/types/path";

export class SettingsStore {
  constructor(private config: {
    store: Record<string, unknown>;
    get<P extends Path<Config>>(key: P): PathValue<Config, P>;
    set<P extends Path<Config>>(key: P, value?: PathValue<Config, P>): void;
  }) { }

  getAll(): Config {
    return this.config.store as Config;
  }

  setAll(config: Config) {
    this.config.store = config;
  }

  get<P extends Path<Config>>(key: P): PathValue<Config, P> {
    return this.config.get(key);
  }

  set<P extends Path<Config>>(key: P, value?: PathValue<Config, P>) {
    this.config.set(key, value);
  }
}