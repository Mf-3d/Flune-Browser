import path from "path";
import { app } from "electron";

import type { RuntimeContext } from "./types";

export function createRuntimeContext(): RuntimeContext {
  const sessionId = new Date().toISOString().replace(/[:.]/g, "-");

  const logDir = path.join(app.getPath("userData"), "logs", sessionId);
  const logFilePath = path.join(logDir, "app.log");

  return {
    sessionId,
    logDir,
    logFilePath,
  };
}
