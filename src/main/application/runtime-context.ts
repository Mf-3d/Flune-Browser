import path from "path";
import { app } from "electron";

import type { RuntimeContext } from "./types";

export function createRuntimeContext(): RuntimeContext {
  const sessionId = new Date().toISOString().replace(/[:.]/g, "-");

  const logDir = path.join(app.getPath("userData"), "logs", sessionId);

  return {
    sessionId,
    logDir,
    log: {
      app: path.join(logDir, "app.log"),
      chromium: path.join(logDir, "chromium.log"),
      chromiumNet: path.join(logDir, "chromium-net.log"),
    },
  };
}
