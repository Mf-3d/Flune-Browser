import path from "node:path";
import fs from "node:fs";
import Store from "electron-store";

import { TabManager } from "./tab";
import { ipcMain } from "electron";

// 内部ページのパス
const SETTING_URL = "flune://settings";
const PRELOAD_PATH = path.join(__dirname, "..", "preload", "settings.js");
const DEFAULT_CONFIG_PATH = path.join(__dirname, "..", "assets", "default", "store", "config-3.json");
const DEFAULT_DATA_PATH = path.join(__dirname, "..", "assets", "default", "store", "data-3.json");

export class Settings {
  private readonly _tabManager: TabManager;
  readonly storeConfig;

  constructor(tabManager: TabManager) {
    this._tabManager = tabManager;

    const DEFAULT_CONFIG = JSON.parse(fs.readFileSync(DEFAULT_CONFIG_PATH, {
      encoding: "utf-8"
    }));

    this.storeConfig = new Store({
      name: "config-3",
      defaults: DEFAULT_CONFIG,
      // schema: {}, // 後で設定する
    });
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
    this.setEvents(tab.id);
  }

  setEvents(tabId: string) {
    this.deleteEvents(tabId);

    const tab = this._tabManager.getTabById(tabId);

    if (!tab) {
      console.error("Could not set events: Tab does not exist.");
      return;
    }

    ipcMain.handle("flune.store.config.get-all", (event) => {
      return this.storeConfig.store;
    });
    ipcMain.handle("flune.store.config.get", (event, key: string) => {
      return this.storeConfig.get(key);
    });
    ipcMain.handle("flune.store.config.save-all", (event, config) => {
      this.storeConfig.store = config;
    });
    ipcMain.handle("flune.store.config.save", (event, key: string, value?: any) => {
      this.storeConfig.set(key, value);
    });
  }

  deleteEvents(tabId: string) {
    const tab = this._tabManager.getTabById(tabId);

    if (!tab) {
      console.error("Could not delete events: Tab does not exist.");
      return;
    }

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