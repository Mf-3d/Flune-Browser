import { handle } from "@/main/ipc/handler";
import { IPC_INVOKE } from "@/shared/ipc/channels";

import type { Settings } from "..";
import type { EventBus } from "@/main/infrastructure/event/event-bus";
import type { Logger } from "@/main/utils/logger";
import type { ApplicationService } from "@/main/application/application-service";
import type { Config } from "@/shared/types/config";
import type { Path, PathValue } from "@/shared/types/path";

export function registerSettingsHandler(logger: Logger, settings: Settings, eventBus: EventBus, appService: ApplicationService) {
  logger.info("Settings IPC handler registration has started.");

  handle(IPC_INVOKE.STORE_GET_ALL, () => {
    return settings.store.getAll();
  });
  handle(IPC_INVOKE.STORE_GET, (_, key: string) => {
    return settings.store.get(key);
  });
  handle(IPC_INVOKE.STORE_SET_ALL, (_, config) => {
    settings.store.setAll(config);

    eventBus.send("settings:updated");
  });
  handle(IPC_INVOKE.STORE_SET, <P extends Path<Config>>(_: Electron.IpcMainInvokeEvent, key: P, value?: PathValue<Config, P>) => {
    settings.store.set(key, value);

    eventBus.send("settings:updated");

    switch (key) {
      case "settings.design.theme":
        eventBus.send("theme:updated", {
          themeId: settings.themeService.getCurrentThemeId(),
        });
        break;
      case "settings.hardwareAcceleration":
        appService.relaunch({
          forced: false,
          reason: "ハードウェアアクセラレーションの設定の変更を適用するには再起動が必要です。"
        });
        break;
    }
  });
  
  logger.info("Settings IPC handler registration has completed.");
}
