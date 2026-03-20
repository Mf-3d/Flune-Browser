import { app, ipcMain } from "electron";
import path from "node:path";

import type { IpcMainInvokeEvent, WebFrameMain } from "electron";
import type { IpcInvoke } from "@/shared/ipc/channels";

export function handle(
  channel: IpcInvoke,
  handler: (event: IpcMainInvokeEvent, ...args: any[]) => any
) {
  ipcMain.handle(channel, (event, ...args: any[]) => {
    if (!event.senderFrame) return null;
    if (!validateSender(event.senderFrame)) return null;

    return handler(event, ...args);
  });
}

/**
 * senderのプロトコルを評価します。
 *
 * @param frame
 * @returns { boolean }
 */
function validateSender(frame: WebFrameMain): boolean {
  const frameUrl = new URL(frame.url.toLowerCase());
  const appDir = path.dirname(app.getAppPath()).replace(/\\/g, "\/").toLowerCase();

  // 既存の URL パーサと allowlist を使用して URL のプロトコルを評価します
  if (frameUrl.protocol === "file:" && frameUrl.pathname.startsWith(`/${appDir}`))
    return true; // 古いかも

  if (!app.isPackaged && process.env.ELECTRON_RENDERER_URL)
    return frameUrl.toString().includes(process.env.ELECTRON_RENDERER_URL);
  else return frameUrl.protocol === "flune:";
}
