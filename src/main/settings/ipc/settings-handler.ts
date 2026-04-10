import { handle } from "@/main/ipc/handler";
import { IPC_INVOKE } from "@/shared/ipc/channels";

import type { Settings } from "..";
import type { EventBus } from "@/main/infrastructure/event/event-bus";
import type { Logger } from "@/main/utils/logger";

export function registerSettingsHandler(logger: Logger, settings: Settings, eventBus: EventBus) {
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
  handle(IPC_INVOKE.STORE_SET, (_, key: string, value?: any) => {
    settings.store.set(key, value);

    eventBus.send("settings:updated");
    if (key === "settings.design.theme")
      eventBus.send("theme:updated", {
        themeId: value,
      });
  });
  
  logger.info("Settings IPC handler registration has completed.");
}
