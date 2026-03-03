export const ROUTE_MAP = {
  navigation: "navigation.html",
  home: "browser/home.html",
  settings: "browser/settings.html",
  version: "browser/version.html",
  error: {
    generic: "browser/error/error.html",
    notFound: "browser/error/server-notfound.html",
  },
  menu: {
    generic: "menu/index.html",
    bookmarks: "menu/bookmarks.html",
  }
} as const;

export type RouteKey = keyof typeof ROUTE_MAP;

// 開発サーバー上とアプリ内プロトコルのパスが違うため解決する必要がある

/**
 * @param path Route of View to resolve to
 * @returns Resolved Path
 * 
 * ```js
 * resolveView(ROUTE_MAP.menu.generic);
 * // -> "flune://menu/index.html" or "http://localhost:0000/menu/index.html"
 * ```
 */
export function resolveView(path: string) {
  const isDev = !!process.env.ELECTRON_RENDERER_URL;

  if (isDev) {
    return new URL(path, process.env.ELECTRON_RENDERER_URL).toString();
  }

  return `flune://${path}`;
}