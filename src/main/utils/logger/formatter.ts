import { LogLevel } from "./levels";

export class Formatter {
  format(level: LogLevel, message: string): string {
    const time = new Date().toISOString();
    return [
      `[${time}]`,
      `[${level.toUpperCase()}]`,
      message
    ].join(" "); // e.g. "[] [INFO] Hello, nice to meet you!"
  }
}