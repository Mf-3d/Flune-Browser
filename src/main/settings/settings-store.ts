import { Config } from "./types";

export class SettingsStore {
  constructor(private config: {
    store: Record<string, unknown>;
    get<K extends keyof Config>(key: K): Config[K];
    set<K extends keyof Config>(key: K, value: Config[K]): void;
  }) { }

  getAll(): Config {
    return this.config.store as Config;
  }

  setAll(config: Config) {
    this.config.store = config;
  }

  get<K extends keyof Config>(key: K): Config[K] {
    return this.config.get(key);
  }

  set<K extends keyof Config>(key: K, value: Config[K]) {
    this.config.set(key, value);
  }
}