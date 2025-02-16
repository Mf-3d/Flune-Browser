import { BrowserWindow } from "electron";
import path from "path";
import { Tab, TabManager } from "./tab";

const SETTING_URL = "flune://settings";
const PRELOAD_URL = path.join(__dirname, "..", "preload", "settings.js");

export class Settings {
  private _tabManager: TabManager;
  constructor(tabManager: TabManager) {
    this._tabManager = tabManager;
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
  }

  deleteEvents(tabId: string) {
    const tab = this._tabManager.getTabById(tabId);

    if (!tab) {
      console.error("Could not delete events: Tab does not exist.");
      return;
    }
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

    preloads.push(PRELOAD_URL);
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

    const detachedPreloads = preloads.filter(preload => preload !== PRELOAD_URL);
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

    return preloads.includes(PRELOAD_URL);
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