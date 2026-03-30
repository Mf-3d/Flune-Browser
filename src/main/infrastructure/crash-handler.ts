import { app } from "electron";

import type { Logger } from "@/main/utils/logger";
import type { RuntimeContext } from "@/main/application/types";

export function registerCrashHandler(logger: Logger, runtime: RuntimeContext) {
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

  app.commandLine.appendSwitch("enable-logging", runtime.log.chromium);
  app.commandLine.appendSwitch("log-net-log", runtime.log.chromiumNet);
  app.commandLine.appendSwitch("v", "1");
}
