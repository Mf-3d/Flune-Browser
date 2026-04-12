import { app } from "electron";

import type { Logger } from "@/main/utils/logger";
import type { ISessionService } from "@/main/infrastructure/session/session-service";

export function registerCrashHandler(logger: Logger, sessionService: ISessionService) {
  logger.info("Crash handler registration has started.");

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

  app.commandLine.appendSwitch("enable-logging", sessionService.getChromiumLogPath());
  app.commandLine.appendSwitch("log-net-log", sessionService.getChromiumNetLogPath());
  app.commandLine.appendSwitch("v", "1");

  logger.info("Crash handler registration has completed.");
}
