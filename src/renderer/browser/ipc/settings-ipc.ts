import type { Path, PathValue } from "../../../shared/types/path";
import type { Config } from "../../../shared/types/config";

export const settingsIpc = {
  async get<P extends Path<Config>>(key: P): Promise<PathValue<Config, P> | undefined> {
    return await window.flune.settings?.get(key);
  },
  async getAll(): Promise<Config | undefined> {
    return await window.flune.settings?.getAll();
  },
  async set<P extends Path<Config>>(key: P, value?: PathValue<Config, P> | undefined) {
    this.get("settings");
    return window.flune.settings?.set(key, value);
  },
  async setAll(value?: Config) {
    return window.flune.settings?.setAll(value);
  },
};
