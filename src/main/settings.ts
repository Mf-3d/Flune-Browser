import path from "node:path";
import fs from "node:fs";
import Store from "electron-store";

import { TabManager } from "./tab";
import { ipcMain } from "electron";

import Event from "./event";

// 内部ページのパス
const SETTING_URL = "flune://settings";
const PRELOAD_PATH = path.join(__dirname, "..", "preload", "settings.js");
const DEFAULT_CONFIG_PATH = path.join(__dirname, "..", "assets", "store", "default", "config-3.json");
const SCHEMA_CONFIG_PATH = path.join(__dirname, "..", "assets", "store", "schema", "config-3.json");
const DEFAULT_DATA_PATH = path.join(__dirname, "..", "assets", "store", "default", "data-3.json");

// interface CONFIG {
//   version: [number, number, number];
//   settings: {
//     autoSave: boolean,
//     window: {
//       bounds: {
//         x?: number,
//         y?: number,
//         width: number,
//         height: number,
//       }
//     };
//     search: {
//       engine: string;
//     };
//     design: {
//       theme: string;
//       showHomeButton: string;
//     };
//   };
//   searchEngines: {
//     id?: string;
//     name: string;
//     url: string;
//   }[];
// };

// const SCHEMA_CONFIG: Store.Schema<CONFIG> = {
//   version: {
//     type: "array",
//     items: {
//       type: "integer",
//       minimum: 0
//     },
//     maxItems: 3,
//     minItems: 3
//   },
//   settings: {
//     type: "object",
//     properties: {
//       autoSave: {
//         type: "boolean"
//       },
//       "window": {
//         type: "object",
//         properties: {
//           bounds: {
//             type: "object",
//             properties: {
//               width: {
//                 type: "integer",
//                 minimum: 0
//               },
//               height: {
//                 type: "integer",
//                 minimum: 0
//               },
//               x: {
//                 type: ["integer", "null"]
//               },
//               y: {
//                 type: ["integer", "null"]
//               }
//             },
//             required: ["width", "height"]
//           }
//         }
//       },
//       search: {
//         type: "object",
//         properties: {
//           engine: {
//             type: "string"
//           }
//         }
//       },
//       design: {
//         type: "object",
//         properties: {
//           theme: {
//             type: "string",
//             pattern: "^[a-z|0-9\\-]+$"
//           },
//           showHomeButton: {
//             type: "boolean"
//           }
//         }
//       }
//     }
//   },
//   searchEngines: {
//     type: "array",
//     items: {
//       type: "object",
//       properties: {
//         id: {
//           type: "string",
//           pattern: "^[a-z|0-9\\-]+$"
//         },
//         name: {
//           type: "string"
//         },
//         url: {
//           type: "string"
//         }
//       },
//       required: ["id", "url"]
//     }
//   }
// };

export type SearchEngine = {
  id: string;
  name: string;
  url: string;
};

export class Settings {
  private event = new Event();
  private readonly _tabManager: TabManager;
  readonly config;

  constructor(tabManager: TabManager) {
    this._tabManager = tabManager;

    const DEFAULT_CONFIG = JSON.parse(fs.readFileSync(DEFAULT_CONFIG_PATH, {
      encoding: "utf-8"
    }));
    const SCHEMA_CONFIG = JSON.parse(fs.readFileSync(SCHEMA_CONFIG_PATH, {
      encoding: "utf-8"
    })).properties;

    this.config = new Store({
      name: "config-3",
      defaults: DEFAULT_CONFIG,
      schema: SCHEMA_CONFIG, // 後で設定する
    });

    this.setEvents();
  }

  // 設定をタブとして開く
  openSettingsAsTab(tabId?: string) {
    if (!tabId) tabId = this._tabManager.activeCurrent || "";
    const tab = this._tabManager.getTabById(tabId);

    if (!tab) {
      console.error("Could not open settings: Tab does not exist.");
      return;
    }

    if (tab.entity.webContents.getURL() !== SETTING_URL) this._tabManager.load(tab.id, SETTING_URL);

    this.attachPreload(tab.id);

    this.event.send("setting-opened", "tab");
  }

  setEvents() {
    this.deleteEvents();

    ipcMain.handle("flune.store.config.get-all", (event) => {
      return this.config.store;
    });
    ipcMain.handle("flune.store.config.get", (event, key: string) => {
      return this.config.get(key);
    });
    ipcMain.handle("flune.store.config.save-all", (event, config) => {
      this.event.send("config-updated");
      this.config.store = config;
    });
    ipcMain.handle("flune.store.config.save", (event, key: string, value?: any) => {
      if(key === "settings.design.theme")  this.event.send("theme-updated");
      this.event.send("config-updated");
      this.config.set(key, value);
    });
  }

  deleteEvents() {
    console.debug("deleting the settings events.")
    ipcMain.removeHandler("flune.store.config.get");
    ipcMain.removeHandler("flune.store.config.get-all");
    ipcMain.removeHandler("flune.store.config.save");
    ipcMain.removeHandler("flune.store.config.save-all");
  }

  // プリロードを追加する
  attachPreload(tabId?: string) {
    if (!tabId) tabId = this._tabManager.activeCurrent || "";
    const tab = this._tabManager.getTabById(tabId);

    if (!tab) {
      console.error("Could not attach preloads: Tab does not exist.");
      return;
    }

    // タブが設定を開いていなければ追加しない
    if (tab.entity.webContents.getURL() !== SETTING_URL) {
      console.error("Could not attach preloads: Tab does not open settings.");
      return;
    }

    let preloads = tab.entity.webContents.session.getPreloads();

    if (this.isAttachedPreloads(tab.id)) return;

    preloads.push(PRELOAD_PATH);
    tab.entity.webContents.session.setPreloads(preloads);

    // プリロードの追加はリロード後に反映される
    this._tabManager.reloadTab(tab.id);
  }

  // プリロードを削除する
  detachPreload(tabId?: string) {
    if (!tabId) tabId = this._tabManager.activeCurrent || "";
    const tab = this._tabManager.getTabById(tabId);

    if (!tab) {
      console.error("Could not attach preloads: Tab does not exist.");
      return;
    }

    const preloads = tab.entity.webContents.session.getPreloads();
    if (!this.isAttachedPreloads(tab.id)) return;

    const detachedPreloads = preloads.filter(preload => preload !== PRELOAD_PATH);
    tab.entity.webContents.session.setPreloads(detachedPreloads);

    // プリロードの削除はリロード後に反映される
    this._tabManager.reloadTab(tab.id);
  }

  // プリロードが追加されているか
  isAttachedPreloads(tabId?: string) {
    if (!tabId) tabId = this._tabManager.activeCurrent || "";
    const tab = this._tabManager.getTabById(tabId);

    if (!tab) {
      console.error("Could not attach preloads: Tab does not exist.");
      return;
    }

    const preloads = tab.entity.webContents.session.getPreloads();

    return preloads.includes(PRELOAD_PATH);
  }

  closeSettings(tabId?: string) {
    if (!tabId) tabId = this._tabManager.activeCurrent || "";
    const tab = this._tabManager.getTabById(tabId);

    if (!tab) {
      console.error("Could not exit settings tab: Tab does not exist.");
      return;
    }

    if (tab.entity.webContents.getURL() === SETTING_URL) return;

    if (this.isAttachedPreloads(tab.id)) this.detachPreload(tab.id);
  }
}