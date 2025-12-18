import { app, WebFrameMain } from "electron";
import path from "node:path";

/**
 * senderのプロトコルを評価します。
 * 
 * @param frame
 * @returns { boolean }
 */
export function validateSender(frame: WebFrameMain): boolean {
  let frameUrl = new URL(frame.url.toLowerCase());
  let appDir = path.dirname(app.getAppPath())
               .replace(/\\/g, "\/")
               .toLowerCase();

  // 既存の URL パーサと allowlist を使用して URL のプロトコルを評価します
  if (frameUrl.protocol === "file:" && frameUrl.pathname.startsWith(`/${appDir}`)) return true;
  return frameUrl.protocol === "flune:";
}