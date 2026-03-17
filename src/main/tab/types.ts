import { resolveView, ROUTE_MAP } from "@/shared/resolveView";

import type { Rectangle, WebContentsView } from "electron";

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