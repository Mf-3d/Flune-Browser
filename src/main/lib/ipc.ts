import { WebFrameMain } from "electron";

/**
 * senderのプロトコルを評価します。
 * 
 * @param frame
 * @returns { boolean }
 */
export function validateSender(frame: WebFrameMain): boolean {
  // 既存の URL パーサと allowlist を使用して URL のプロトコルを評価します
  return (new URL(frame.url)).protocol === "flune:";
}