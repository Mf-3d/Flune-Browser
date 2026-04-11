import path from "path";
import { app } from "electron";

import { parseRuntimeType, type RuntimeType } from "./runtime-types";

export class RuntimeContext {
  readonly runtime: RuntimeType;
  readonly sessionId: string;
  readonly log: {
    app: string;
    chromium: string;
    chromiumNet: string;
  };

  constructor() {
    this.runtime = this.detectRuntime();
    this.sessionId = this.generateSessionId();
    this.log = this.generateLogPathes();
  }

  private detectRuntime(): RuntimeType {
    const arg = process.argv.find((a) => a.startsWith("--runtime="));

    if (arg) return parseRuntimeType(arg);
    else {
      return app.isPackaged ? "production" : "dev";
    }
  }

  private generateSessionId(): string {
    return new Date().toISOString().replace(/[:.]/g, "-");
  }

  private generateLogPathes() {
    const logDir = path.join(app.getPath("userData"), "logs", this.sessionId);

    return {
      app: path.join(logDir, "app.log"),
      chromium: path.join(logDir, "chromium.log"),
      chromiumNet: path.join(logDir, "chromium-net.log"),
    };
  }
}