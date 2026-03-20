import { app } from "electron";
import fs from "node:fs";
import path from "node:path";

const LOG_DIR = app.getPath("userData");
const LOG_FILE = path.join(LOG_DIR, "app-crash.log");

export function registerCrashHandler() {
  // クラッシュ時にログを保存する。

  process.on("uncaughtException", (err) => {
    log(`UNCAUGHT: ${err.stack ?? err.message}`);
  });

  app.on("render-process-gone", (_event, _webContents, details) => {
    log(`RENDERER GONE: ${details.reason}`);
  });
}

/**
 * @deprecated
 */
export function log(message: string) {
  console.error(message);
  fs.appendFileSync(
    LOG_FILE,
    `[${new Date().toISOString()}] ${message}\n`
  );
}