import { IPC_NOTIFY } from "../shared/ipc/channels";
import { ipcRenderer } from "electron";
import { BrowserAPI } from "@/shared/types/preload-api";

export function isBrowserPage() {
  const isDev = !process.argv.includes("--is-packaged=true") && !!process.env.ELECTRON_RENDERER_URL;

  if (isDev) {
    const devUrl = new URL(process.env.ELECTRON_RENDERER_URL!);
    return (
      window.location.host === devUrl.host &&
      window.location.pathname.startsWith("/browser/")
    );
  }

  return (
    window.location.protocol === "flune:" &&
    window.location.host.startsWith("browser/")
  );
}

export const BROWSER: BrowserAPI = {
  onThemeChanged: (callback) => ipcRenderer.on(
    IPC_NOTIFY.TAB_THEME,
    (event, tab) => callback(event, tab)
  ),
};