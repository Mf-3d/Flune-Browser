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

  app.on("child-process-gone", (_event, details) => {
    log(`CHILD PROCESS GONE: ${details.reason}`);
  });

  app.on("render-process-gone", (_event, _webContents, details) => {
    log(`RENDERER GONE: ${details.reason}`);
  });

  // app.commandLine.appendSwitch("enable-logging");
  // app.commandLine.appendSwitch("v", "1");
}

/**
 * @deprecated
 */
export function log(message: string) {
  console.error(message);
  fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${message}\n`);
}
