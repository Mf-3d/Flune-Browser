import type { Data } from "@/shared/types/data";
import type { Path, PathValue } from "@/shared/types/path";
import fs from "node:fs";
import path from "node:path";
import Store from "electron-store";

const DEFAULT_DATA_PATH = path.join(
  __dirname,
  "..",
  "..",
  "assets",
  "store",
  "default",
  "data-3.json"
);

export class DataStore {
  private readonly config: {
    store: Record<string, unknown>;
    get<P extends Path<Data>>(key: P): PathValue<Data, P>;
    set<P extends Path<Data>>(key: P, value?: PathValue<Data, P>): void;
  };

  constructor() {
    const DEFAULT_DATA = JSON.parse(
      fs.readFileSync(DEFAULT_DATA_PATH, {
        encoding: "utf-8",
      })
    );

    this.config = new Store<Data>({
      name: "data-3",
      defaults: DEFAULT_DATA,
    });
  }

  getAll(): Data {
    return this.config.store as Data;
  }

  setAll(config: Data) {
    this.config.store = config;
  }

  get<P extends Path<Data>>(key: P): PathValue<Data, P> {
    return this.config.get(key);
  }

  set<P extends Path<Data>>(key: P, value?: PathValue<Data, P>) {
    this.config.set(key, value);
  }
}
