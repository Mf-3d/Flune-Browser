import path from "path";
import { TabCollection } from "./tab-collection";
import { Tab } from "./tab";
import { registerTabEvents } from "./tab-events";
import { Window } from "@/main/window/window";
import { IPC_NOTIFY } from "@/shared/ipc/channels";
import { Settings } from "@/main/settings";
import Event from "@/main/lib/event";
import { TabState } from "@/shared/types/preload-api";
import { resolveView, ROUTE_MAP } from "@/shared/resolveView";

const HOME_URL = resolveView(ROUTE_MAP.home);

export class TabManager {
  constructor(
    private readonly collection: TabCollection,
    private readonly window: Window,
    private readonly settings: Settings,
    private readonly event: Event,
  ) { }

  get length() {
    return this.collection.length;
  }

  /**
   * Creates a new tab.
   * @param options 
   * @returns The new tab
   */
  createTab(options: Partial<{
    /**
     * @default false
     */
    url: string;
    isActive: boolean;
    beforeTabId: string;
  }>): Tab {
    const view = new Electron.WebContentsView({
      webPreferences: {
        preload: path.join(__dirname, "..", "preload", "index.js"),
        contextIsolation: true,
        scrollBounce: true,
      }
    });

    const tab = new Tab(view, () => {
      this.createTab({
        isActive: true,
      });
    });

    registerTabEvents(tab, this.collection, this.window, this.settings, this.event);

    this.collection.add(tab, options.beforeTabId);

    this.window.navigation.send(IPC_NOTIFY.TAB_CREATED, {
      id: tab.id,
      title: tab.title,
      beforeTabId: options.beforeTabId,
    });

    tab.attachView(this.window);

    if (options.isActive) this.activateTab(tab.id);
    
    this.navigate(options.url ?? HOME_URL, tab.id);

    return tab;
  }

  /**
   * Removes the tab.
   * @param id 
   */
  removeTab(id: string) {
    const removedTab = this.collection.get(id);

    if (!removedTab) {
      throw new Error("Tab does not exist.");
    }

    const index = this.collection.getIndex(id);

    const wasActive = this.collection.isActive(id);

    removedTab.close();

    this.collection.remove(id);

    this.window.navigation.send(IPC_NOTIFY.TAB_REMOVED, id);

    if (this.collection.length < 1) this.window.close();

    if (wasActive) {
      const nextIndex = index === 0 ? index + 1 : index - 1;
      const next = this.collection.at(nextIndex);

      if (!next) {
        throw new Error("Next tab to activate does not exist.");
      }

      this.activateTab(next.id);
    }
  }

  /**
   * Removes all tabs.
   */
  removeAll() {
    for (const tab of this.collection.getAll()) {
      tab.close();
    }

    this.collection.removeAll();
  }

  moveBefore(id: string, beforeTabId: string) {
    const from = this.collection.getIndex(id);
    const to = this.collection.getIndex(beforeTabId);
    this.collection.move(from, to);

    // TODO: レンダラーに通知
  }

  moveAfter(id: string, afterTabId: string) {
    const from = this.collection.getIndex(id);
    const to = this.collection.getIndex(afterTabId);
    this.collection.move(
      from,
      from < to
        ? to
        : to + 1
    );

    // TODO: レンダラーに通知
  }

  activateTab(id: string) {
    this.collection.setActive(id);

    const state: TabState = {
      id,
      active: true,
    };

    this.window.navigation.send(IPC_NOTIFY.TAB_UPDATED, state);
  }

  /**
   * @param input URL or search words.
   * @param tabId
   */
  navigate(input: string, tabId?: string) {
    const tab =
      tabId
        ? this.collection.get(tabId)
        : this.collection.getActive();

    if (!tab) throw new Error("Tab does not exist.");

    if (URL.canParse(input)) {
      tab.loadURL(input);
    } else {
      const engineIdCurrent = this.settings.searchEngineService.getCurrentSearchEngineId();
      const engine = this.settings.searchEngineService.getEngineById(engineIdCurrent);

      if (!engine) throw new Error("Engine does not exist.");
      
      const searchUrl = engine.url.replace(/%s/g, input);

      tab.loadURL(searchUrl);
    }
  }

  getActiveTab(): Tab | undefined {
    return this.collection.getActive();
  }
}