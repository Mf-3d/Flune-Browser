import { app } from "electron";

import { registerCrashHandler } from "@/main/infrastructure/crash-handler";
import { Protocol } from "@/main/protocols/AppProtocol";
import { isArchitectureIntel } from "@/main/system/env";
import { WindowManager } from "@/main/window/window-manager";
import { BookmarkService } from "@/main/bookmark/service";
import { Settings, createSettings } from "@/main/settings/";
import { EventBus } from "@/main/infrastructure/event/event-bus";
import { Logger } from "@/main/utils/logger";
import { config } from "@/app.config";

import { createRuntimeContext } from "./application/runtime-context";
import { resolveView, ROUTE_MAP } from "@/shared/resolveView";
import { registerTabHandler } from "@/main/tab/ipc/tab-handler";
import { registerSettingsHandler } from "@/main/settings/ipc/settings-handler";
import { registerBookmarkHandler } from "@/main/bookmark/ipc/bookmark-handler";
import { registerAppHandler } from "@/main/application/ipc/app-handler";
import { ApplicationService } from "@/main/application/application-service";
import { registerOptionMenuHandler } from "@/main/menu/option-menu/ipc/option-menu-handler";
import { DataStore } from "@/main/infrastructure/storage/data-store";
import { BookmarkRepository } from "@/main/bookmark/repository";
import type { RuntimeContext } from "./application/types";
import { registerLogHandler } from "./logger/ipc/log-handler";

type Services = {
  logger: Logger;
  protocol: Protocol;
  settings: Settings;
  windowManager: WindowManager;
  data: DataStore;
  eventBus: EventBus;
  bookmarkService: BookmarkService;
  appService: ApplicationService;
};

export function bootstrap() {
  const runtime = createRuntimeContext();

  app.setName(config.productName);
  if (process.platform === "darwin" && isArchitectureIntel()) {
    app.disableHardwareAcceleration();
  }

  const services = initializeServices(runtime);
  registerAppEvents(services);
}

function registerAppEvents(services: Services) {
  app.on("ready", () => {
    onReady(services);
  });

  app.on("window-all-closed", () => {
    handleWindowAllClosed();
  });
}

function initializeServices(runtime: RuntimeContext): Services {
  const logger = new Logger(runtime.logFilePath);
  const protocol = new Protocol(config.protocol);
  const data = new DataStore();
  const eventBus = new EventBus();

  const bookmarkRepository = new BookmarkRepository(data);

  const bookmarkService = new BookmarkService(bookmarkRepository, eventBus);
  const appService = new ApplicationService(bookmarkService);

  const settings = createSettings(appService, logger);
  const windowManager = new WindowManager(
    appService,
    bookmarkService,
    settings,
    eventBus
  );

  return {
    logger,
    protocol,
    settings,
    windowManager,
    data,
    eventBus,
    bookmarkService,
    appService,
  };
}

function onReady(services: Services) {
  if (services.appService.isPackaged) {
    services.logger.info("Application is packaged.");
    services.logger.setLogLevel("warn");
  } else {
    services.logger.setLogLevel("info");
  }

  services.protocol.handle();

  registerCrashHandler(services.logger);
  registerLogHandler(services.logger);
  registerAppHandler(services.appService, services.windowManager);
  registerSettingsHandler(services.settings, services.eventBus);
  registerTabHandler(services.windowManager, resolveView(ROUTE_MAP.home));
  registerBookmarkHandler(
    services.windowManager,
    services.bookmarkService,
    services.logger
  );
  registerOptionMenuHandler(services.windowManager);

  services.eventBus.send("init");
  services.windowManager.create();

  app.on("activate", () => {
    services.windowManager.ensure();
  });
}

function handleWindowAllClosed() {
  if (process.platform !== "darwin") {
    app.quit();
  }
}
