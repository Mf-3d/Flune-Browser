import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import stripAnsi from "strip-ansi";

import { LogLevel } from "./levels";
import { styleText } from "node:util";

export interface Writer {
  write(level: LogLevel, text: string): void;
}

export class ConsoleWriter implements Writer {
  write(level: LogLevel, text: string) {
    try {
      const colored = this.colorize(level, text);

      if (level === "error") {
        // eslint-disable-next-line
        console.error(colored);
      } else if (level === "warn") {
        // eslint-disable-next-line
        console.warn(colored);
      } else if (level === "info") {
        // eslint-disable-next-line
        console.info(colored);
      } else if (level === "debug") {
        // eslint-disable-next-line
        console.debug(colored);
      } else {
        // eslint-disable-next-line
        console.log(colored);
      }
    } catch (err) {
      // eslint-disable-next-line
      console.error(styleText(["red", "bold"], "Failed to write to console:"), err);
    }
  }

  // 色を付ける
  private colorize(level: LogLevel, text: string) {
    switch (level) {
      case "info":
        return chalk.blue(text);
      case "warn":
        return chalk.yellow.bold(text);
      case "error":
        return chalk.red.bold(text);
      default:
        return chalk.gray(text);
    }
  }
}

export class FileWriter implements Writer {
  constructor(private readonly filePath: string) {}

  write(_level: LogLevel, text: string): void {
    try {
      const plain = stripAnsi(text);

      const dir = path.dirname(this.filePath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.appendFileSync(this.filePath, `${plain}\n`);
    } catch (err) {
      // eslint-disable-next-line
      console.error(styleText(["red", "bold"], "Failed to write to file:"), err);
    }
  }
}
