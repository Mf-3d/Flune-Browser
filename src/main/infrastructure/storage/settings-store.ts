import type { Config } from "@/shared/types/config";
import type { Path, PathValue } from "@/shared/types/path";
import fs from "node:fs";
import path from "node:path";
import Store from "electron-store";

const DEFAULT_CONFIG_PATH = path.join(
  __dirname,
  "..",
  "..",
  "assets",
  "store",
  "default",
  "config-3.json"
);

export class SettingsStore {
  private readonly config: {
    store: Record<string, unknown>;
    get<P extends Path<Config>>(key: P): PathValue<Config, P>;
    set<P extends Path<Config>>(key: P, value?: PathValue<Config, P>): void;
  };

  constructor() {
    const DEFAULT_CONFIG = JSON.parse(
      fs.readFileSync(DEFAULT_CONFIG_PATH, {
        encoding: "utf-8",
      })
    );

    this.config = new Store<Config>({
      name: "config-3",
      defaults: DEFAULT_CONFIG,
    });
  }

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
