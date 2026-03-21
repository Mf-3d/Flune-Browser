import { handle } from "@/main/ipc/handler";
import { IPC_INVOKE } from "@/shared/ipc/channels";

import type { Logger } from "@/main/utils/logger";

export function registerLogHandler(logger: Logger) {
  handle(IPC_INVOKE.LOG_INFO, (_, message: string) => {
    logger.info(`RENDERER: ${message}`);
  });

  handle(IPC_INVOKE.LOG_WARN, (_, message: string) => {
    logger.warn(`RENDERER: ${message}`);
  });

  handle(IPC_INVOKE.LOG_ERROR, (_, message: string | Error) => {
    logger.error(`RENDERER: ${message.toString()}`);
  });
}
