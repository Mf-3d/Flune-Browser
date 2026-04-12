import { app } from "electron";
import path from "node:path";

export interface ISessionService {
  getAppLogPath(): string;
  getChromiumLogPath(): string;
  getChromiumNetLogPath(): string;
}

export class SessionService implements ISessionService {
  private readonly sessionId = this.generateSessionId();
  private readonly logDir = path.join(app.getPath("userData"), "logs", this.sessionId);

  private generateSessionId(): string {
    return new Date().toISOString().replace(/[:.]/g, "-");
  }

  getAppLogPath() {
    return path.join(this.logDir, "app.log");
  }

  getChromiumLogPath() {
    return path.join(this.logDir, "chromium.log");
  }

  getChromiumNetLogPath() {
    return path.join(this.logDir, "chromium-net.log");
  }
}
