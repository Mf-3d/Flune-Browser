import { IPC_INVOKE, IPC_NOTIFY } from "@/shared/ipc/channels";
import { ipcRenderer } from "electron";
import { config } from "@/app.config";

import type { BrowserAPI } from "@/shared/types/preload-api";

export function isBrowserPage() {
  const isDev =
    !process.argv.includes("--is-packaged=true") && !!process.env.ELECTRON_RENDERER_URL;

  if (isDev) {
    const devUrl = new URL(process.env.ELECTRON_RENDERER_URL!);
    return (
      window.location.host === devUrl.host &&
      window.location.pathname.startsWith("/browser/")
    );
  } else {
    return (
      window.location.protocol === `${config.protocol}:` &&
      window.location.pathname.startsWith("/browser/")
    );
  }
}

export const BROWSER: BrowserAPI = {
  navigate: (input) => {
    ipcRenderer.invoke(IPC_INVOKE.TAB_NAVIGATE, undefined, input); // ページをロードする
  },

  onThemeChanged: (callback) =>
    ipcRenderer.on(IPC_NOTIFY.TAB_THEME, (event, themeUrl) => callback(event, themeUrl)),
};
