import { resolveView, ROUTE_MAP } from "@/shared/resolveView";

import type { Rectangle, WebContentsView } from "electron";
import type { TabCollection } from "./tab-collection";
import type { Window } from "@/main/window/window";
import type { Settings } from "@/main/settings";
import type { EventBus } from "@/main/infrastructure/event/event-bus";

export type TabManagerOptions = {
  collection: TabCollection;
  window: Window;
  settings: Settings;
  eventBus: EventBus;
};

export type TabOptions = {
  view: WebContentsView;
  bounds: Rectangle;
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