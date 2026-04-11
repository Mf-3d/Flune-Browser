import { resolveView, ROUTE_MAP } from "@/shared/resolveView";

import type { WebContentsView } from "electron";
import type { TabCollection } from "./tab-collection";
import type { Window } from "@/main/window/window";
import type { Settings } from "@/main/settings";
import type { EventBus } from "@/main/infrastructure/event/event-bus";
import type { Tab } from "./tab";
import type { Rect } from "@/shared/types/rect";
import type { BookmarkService } from "@/main/bookmark/service";
import type { HistoryService } from "@/main/history/service";
import type { Logger } from "@/main/utils/logger";

export type TabManagerContext = {
  logger: Logger;
  collection: TabCollection;
  window: Window;
  bookmarkService: BookmarkService;
  historyService: HistoryService;
  settings: Settings;
  eventBus: EventBus;
};

export type TabContext = {
  logger: Logger;
  view: WebContentsView;
  bounds: Rect;
};

export type TabEventContext = {
  logger: Logger;
  tab: Tab;
  isActiveTab: (id: string) => boolean;
  window: Window;
  bookmarkService: BookmarkService;
  historyService: HistoryService;
  settings: Settings;
  eventBus: EventBus;
};

export const ERR_CODES = {
  // "aborted": -3,
  "server-notfound": -105,
  // "internet-disconnected": -106,
  // "connection-timed-out": -118,
} as const;

export const ERR_PAGES: Record<keyof typeof ERR_CODES, string> & {
  directory: string;
  generic: string;
} = {
  directory: resolveView(ROUTE_MAP.error.directory),
  generic: resolveView(ROUTE_MAP.error.generic),
  "server-notfound": resolveView(ROUTE_MAP.error.notFound),
} as const;
