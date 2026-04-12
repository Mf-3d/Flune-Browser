import path from "node:path";
import { Tab } from "./tab";
import { IPC_NOTIFY } from "@/shared/ipc/channels";
import { resolveView, ROUTE_MAP } from "@/shared/resolveView";
import { WebContentsView } from "electron";
import { registerTabEvents } from "./events/tab-events";
import { ContextMenuController } from "@/main/menu/context-menu/controllers/context-menu-controller";

import type { TabState } from "@/shared/types/preload-api";
import type { Logger } from "@/main/utils/logger";
import type { TabCollection } from "./collections/tab-collection";
import type { BookmarkService } from "@/main/bookmark/service";
import type { Window } from "@/main/window/window";
import type { HistoryService } from "@/main/history/service";
import type { Settings } from "@/main/settings";
import type { EventBus } from "@/main/infrastructure/event/event-bus";

type TabManagerContext = {
  logger: Logger;
  collection: TabCollection;
  window: Window;
  bookmarkService: BookmarkService;
  historyService: HistoryService;
  settings: Settings;
  eventBus: EventBus;
};

export class TabManager {
  private activeTabId?: string;
  private readonly logger;
  private readonly collection;
  private readonly window;
  private readonly bookmarkService;
  private readonly historyService;
  private readonly settings;
  private readonly eventBus;
  private readonly contextMenuController;

  constructor(context: TabManagerContext) {
    this.logger = context.logger;
    this.collection = context.collection;
    this.window = context.window;
    this.bookmarkService = context.bookmarkService;
    this.historyService = context.historyService;
    this.settings = context.settings;
    this.eventBus = context.eventBus;

    this.contextMenuController = new ContextMenuController(this.window);
  }

  get length() {
    return this.collection.length;
  }

  /**
   * Creates a new tab.
   * @param options
   * @returns The new tab
   */
  createTab(
    options?: Partial<{
      input: string;
      /**
       * @default false
       */
      isActive: boolean;
      beforeTabId: string;
    }>
  ): Tab {
    const view = new WebContentsView({
      webPreferences: {
        preload: path.join(__dirname, "..", "preload", "index.js"),
        contextIsolation: true,
        scrollBounce: true,
      },
    });

    const tab = new Tab({
      view,
      logger: this.logger,
      bounds: {
        x: 0,
        y: this.window.viewY,
        width: this.window.getBounds().width,
        height: this.window.getBounds().height - this.window.viewY,
      },
    });

    tab.cleanupEvents = registerTabEvents({
      tab,
      isActiveTab: (id) => this.isActiveTab(id),
      logger: this.logger,
      window: this.window,
      settings: this.settings,
      bookmarkService: this.bookmarkService,
      historyService: this.historyService,
      eventBus: this.eventBus,
    });
    this.contextMenuController.register(tab.webContents, {
      area: "tab",
      tab,
    });

    tab.webContents.setWindowOpenHandler((details) => {
      const tab = this.createTab({
        isActive: true,
      });

      tab.loadURL(details.url);

      return {
        action: "deny",
      };
    });

    this.collection.add(tab, options?.beforeTabId);

    this.window.navigation.send(IPC_NOTIFY.TAB_CREATED, {
      id: tab.id,
      title: tab.title,
      beforeTabId: options?.beforeTabId,
    });

    tab.attachView(this.window);

    if (options?.isActive) this.activateTab(tab.id);

    this.navigate(options?.input ?? resolveView(ROUTE_MAP.home), tab.id);

    return tab;
  }

  /**
   * Removes the tab.
   * @param id Tab ID to remove.
   */
  removeTab(id: string) {
    const removedTab = this.collection.get(id);

    if (!removedTab) {
      throw new Error("Tab does not exist.");
    }

    const index = this.collection.getIndex(id);

    const wasActive = this.isActiveTab(id);

    removedTab.close();

    this.collection.remove(id);

    this.window.navigation.send(IPC_NOTIFY.TAB_REMOVED, id);

    if (this.collection.length < 1) this.window.close();

    if (wasActive) {
      const next = this.decideNextActiveTab(index);

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

  private decideNextActiveTab(removedTabIndex: number): Tab | undefined {
    const nextIndex = removedTabIndex === 0 ? 0 : removedTabIndex - 1;

    return this.collection.at(nextIndex);
  }

  moveTab(from: number, to: number) {
    this.collection.move(from, to);

    const order = this.collection.getAll().map((t) => t.id);
    this.window.navigation.send(IPC_NOTIFY.TABS_REORDERED, order);
  }

  moveBefore(id: string, beforeTabId: string) {
    const from = this.collection.getIndex(id);
    const to = this.collection.getIndex(beforeTabId);
    this.collection.move(from, to);

    const order = this.collection.getAll().map((t) => t.id);
    this.window.navigation.send(IPC_NOTIFY.TABS_REORDERED, order);
  }

  moveAfter(id: string, afterTabId: string) {
    const from = this.collection.getIndex(id);
    const to = this.collection.getIndex(afterTabId);
    this.collection.move(from, from < to ? to : to + 1);

    const order = this.collection.getAll().map((t) => t.id);
    this.window.navigation.send(IPC_NOTIFY.TABS_REORDERED, order);
  }

  /**
   * @param input URL or search words.
   * @param tabId Tab ID to navigate to.
   */
  navigate(input: string, tabId?: string) {
    const tab = tabId ? this.collection.get(tabId) : this.getActiveTab();

    if (!tab) throw new Error("Tab does not exist.");

    if (URL.canParse(input)) {
      tab.loadURL(input);
    } else {
      const engineIdCurrent =
        this.settings.searchEngineService.getCurrentSearchEngineId();
      const engine = this.settings.searchEngineService.getEngineById(engineIdCurrent);

      if (!engine) throw new Error("Engine does not exist.");

      const searchUrl = engine.url.replace(/%s/g, input);

      tab.loadURL(searchUrl);
    }
  }

  /**
   * @param id Tab ID to activate.
   */
  activateTab(id: string) {
    this.activeTabId = id;

    this.collection.getAll().forEach((tab) => {
      tab.setVisible(tab.id === id);
    });

    const activeTab: Tab | undefined = this.getActiveTab();

    if (!activeTab) {
      throw new Error("Tab does not exist.");
    }

    activeTab.focus();

    const state: TabState = {
      id,
      active: true,
    };

    this.window.navigation.send(IPC_NOTIFY.TAB_UPDATED, state);

    this.window.navigation.updateState({
      input: activeTab.url?.toString(),
      ...(activeTab.url
        ? {
            isBookmarked: this.bookmarkService.isBookmarked(activeTab.url.toString()),
          }
        : {}),
    });

    this.logger.info(`Tab (${activeTab.id}) has activated.`);
  }

  getActiveTab(): Tab | undefined {
    return this.activeTabId ? this.collection.get(this.activeTabId) : undefined;
  }

  getActiveIndex(): number {
    return this.collection.getAll().findIndex((tab) => tab.id === this.activeTabId);
  }

  isActiveTab(id: string): boolean {
    return id === this.activeTabId;
  }
}
