import { app } from "electron";

import type { Logger } from "../utils/logger";

export function registerCrashHandler(logger: Logger) {
  // クラッシュ時にログを保存する。

  process.on("uncaughtException", (err) => {
    logger.error(`UNCAUGHT: ${err.stack ?? err.message}`);
  });

  app.on("child-process-gone", (_event, details) => {
    logger.error(`CHILD PROCESS GONE: ${details.reason}`);
  });

  app.on("render-process-gone", (_event, _webContents, details) => {
    logger.error(`RENDERER GONE: ${details.reason}`);
  });

  // app.commandLine.appendSwitch("enable-logging");
  // app.commandLine.appendSwitch("v", "1");
}
