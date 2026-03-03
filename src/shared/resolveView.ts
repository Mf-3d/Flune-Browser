import { app } from "electron";

const ROUTE_MAP: Record<string, string> = {
  navigation: "navigation.html",
  home: "browser/home.html",
  settings: "browser/settings.html",
  version: "browser/version.html",
  "error/error": "browser/error/error.html",
  "error/server-notfound": "browser/error/server-notfound.html",
  "menu/top": "menu/index.html",
  "menu/bookmarks": "menu/bookmarks.html",
} as const;

// type RouteMap =
//   typeof ROUTE_MAP[keyof typeof ROUTE_MAP];

export function resolveView(route: string): string {
  const filePath = ROUTE_MAP[route];

  if (!filePath) throw new Error("Unknown route");

  return (
    (!app.isPackaged && process.env.ELECTRON_RENDERER_URL) ?
    `${process.env.ELECTRON_RENDERER_URL}/${filePath}` :
    `flune://${route}`
  );
}