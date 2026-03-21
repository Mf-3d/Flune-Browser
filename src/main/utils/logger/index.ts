import { LOG_LEVEL_PRIORITY, LogLevel } from "./levels";
import { Formatter } from "./formatter";
import { Writer, ConsoleWriter, FileWriter } from "./writer";
import { NormalizedLog, Normalizer } from "./normalizer";
import { styleText } from "node:util";

export class Logger {
  private currentLogLevel: LogLevel = "info";
  private normalizer: Normalizer;
  private formatter: Formatter;
  private writers: Writer[];

  constructor(filePath: string) {
    this.normalizer = new Normalizer();
    this.formatter = new Formatter();
    this.writers = [new ConsoleWriter(), new FileWriter(filePath)];
  }

  setLogLevel(level: LogLevel) {
    this.currentLogLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.currentLogLevel];
  }

  /**
   * @param level Log Level.
   * @param normalized Normalized Log.
   * @returns
   */
  private output(level: LogLevel, normalized: NormalizedLog) {
    if (!this.shouldLog(level)) return;

    const formatted = this.formatter.format(
      level,
      normalized.stack ?? normalized.message
    );
    this.writers.forEach((writer) => writer.write(level, formatted));
  }

  info(message: string) {
    try {
      const normalized = this.normalizer.normalize(message);
      this.output("info", normalized);
    } catch (err) {
      // eslint-disable-next-line
      console.error(styleText(["red", "bold"], "Failed to output log:"), err);
    }
  }

  warn(message: string) {
    try {
      const normalized = this.normalizer.normalize(message);
      this.output("warn", normalized);
    } catch (err) {
      // eslint-disable-next-line
      console.error(styleText(["red", "bold"], "Failed to output log:"), err);
    }
  }

  error(message: string | Error) {
    try {
      const normalized = this.normalizer.normalize(message);
      this.output("error", normalized);
    } catch (err) {
      // eslint-disable-next-line
      console.error(styleText(["red", "bold"], "Failed to output log:"), err);
    }
  }
}
