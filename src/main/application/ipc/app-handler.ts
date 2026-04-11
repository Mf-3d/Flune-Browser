import { IPC_INVOKE } from "@/shared/ipc/channels";
import { handle } from "@/main/ipc/handler";
import { config } from "@/app.config";
import { resolveView, ROUTE_MAP } from "@/shared/resolveView";

import type { ApplicationService } from "../application-service";
import type { WindowManager } from "@/main/window/window-manager";
import type { Logger } from "@/main/utils/logger";

export function registerAppHandler(
  logger: Logger,
  appService: ApplicationService,
  windowManager: WindowManager
) {
  logger.info("Application IPC handler registration has started.");

  handle(IPC_INVOKE.APP_GET_VERSION, () => {
    return config.version;
  });

  handle(IPC_INVOKE.APP_GET_VERSIONS, () => {
    return config.versions;
  });

  handle(IPC_INVOKE.APP_GET_COMPUTER_INFO, () => {
    return {
      arch: process.arch,
      platform: process.platform,
    };
  });

  handle(IPC_INVOKE.APP_UPDATE_SYMBOL_COLOR, (event, color: string) => {
    if (process.platform === "win32" || process.platform === "linux") {
      const window = windowManager.getWindowFromWebContents(event.sender);

      if (!window) {
        throw new Error("Window does not exist.");
      }

      window.setTitleBarOverlay({
        symbolColor: color,
      });
    }
  });

  handle(IPC_INVOKE.APP_SHOW_SETTINGS_PAGE, (event) => {
    const window = windowManager.getWindowFromWebContents(event.sender);

    if (!window) {
      throw new Error("Window does not exist.");
    }

    window.tabManager.navigate(resolveView(ROUTE_MAP.settings));
  });

  handle(IPC_INVOKE.APP_SHOW_VERSIONS_PAGE, (event) => {
    const window = windowManager.getWindowFromWebContents(event.sender);

    if (!window) {
      throw new Error("Window does not exist.");
    }

    window.tabManager.navigate(resolveView(ROUTE_MAP.version));
  });

  handle(IPC_INVOKE.APP_QUIT, (_, forced: boolean) => {
    appService.quit({
      forced
    });
  });

  logger.info("Application IPC handler registration has completed.");
}
