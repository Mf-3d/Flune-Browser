import { app } from "electron";

import { config } from "@/app.config";
import { isArchitectureIntel } from "@/main/system/env";
import { createRuntimeContext } from "./application/runtime-context";
import { resolveView, ROUTE_MAP } from "@/shared/resolveView";

import { DataStore } from "@/main/infrastructure/storage/data-store";
import { Protocol } from "@/main/protocols/AppProtocol";
import { WindowManager } from "@/main/window/window-manager";
import { Settings, createSettings } from "@/main/settings/";
import { EventBus } from "@/main/infrastructure/event/event-bus";
import { Logger } from "@/main/utils/logger";

import { ApplicationService } from "@/main/application/application-service";
import { BookmarkService } from "@/main/bookmark/service";
import { BookmarkRepository } from "@/main/bookmark/repository";
import { HistoryService } from "@/main/history/service";
import { HistoryRepository } from "@/main/history/repository";
import { FaviconService } from "./favicon/service";

import { registerLogHandler } from "@/main/logger/ipc/log-handler";
import { registerCrashHandler } from "@/main/infrastructure/crash-handler";
import { registerTabHandler } from "@/main/tab/ipc/tab-handler";
import { registerSettingsHandler } from "@/main/settings/ipc/settings-handler";
import { registerBookmarkHandler } from "@/main/bookmark/ipc/bookmark-handler";
import { registerAppHandler } from "@/main/application/ipc/app-handler";
import { registerOptionMenuHandler } from "@/main/menu/option-menu/ipc/option-menu-handler";

import type { RuntimeContext } from "@/main/application/types";

type Services = {
  logger: Logger;
  protocol: Protocol;
  settings: Settings;
  windowManager: WindowManager;
  data: DataStore;
  eventBus: EventBus;
  bookmarkService: BookmarkService;
  historyService: HistoryService;
  // faviconService: FaviconService;
  appService: ApplicationService;
};

export async function bootstrap() {
  const runtime = createRuntimeContext();

  app.setName(config.productName);

  if (process.platform === "darwin" && isArchitectureIntel()) {
    app.disableHardwareAcceleration();
  }

  const services = initializeServices(runtime);
  services.logger.info("The services have been initialized.");

  if (!services.settings.store.get("settings.hardwareAcceleration")) {
    services.appService.disableHardwareAcceleration();
    services.logger.info("Hardware acceleration is disabled.");
  } else {
    services.logger.info("Hardware acceleration will be enabled.");
  }

  services.logger.info("Application events are registering...");
  registerAppEvents(services, runtime);
}

function registerAppEvents(services: Services, runtime: RuntimeContext) {
  app.on("ready", () => {
    onReady(services, runtime);
  });

  app.on("window-all-closed", () => {
    onWindowAllClosed(services.logger);
  });
}

function initializeServices(runtime: RuntimeContext): Services {
  const logger = new Logger(runtime.log.app);
  const protocol = new Protocol(config.protocol, logger);
  const data = new DataStore();
  const eventBus = new EventBus();

  const bookmarkRepository = new BookmarkRepository(data);
  const historyRepository = new HistoryRepository(data);

  // const faviconService = new FaviconService();
  const bookmarkService = new BookmarkService(bookmarkRepository, eventBus);
  const historyService = new HistoryService(historyRepository);

  const appService = new ApplicationService(bookmarkService);

  const settings = createSettings(appService, logger);
  const windowManager = new WindowManager(
    logger,
    appService,
    // faviconService,
    bookmarkService,
    historyService,
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
    historyService,
    // faviconService,
    appService,
  };
}

function onReady(services: Services, runtime: RuntimeContext) {
  services.logger.info('Event "ready" has started.');

  if (services.appService.isPackaged) {
    services.logger.info("Application is packaged.");
    services.logger.setLogLevel("info");
  } else {
    services.logger.setLogLevel("debug");
  }

  try {
    services.protocol.handle();

    registerCrashHandler(services.logger, runtime);
    registerLogHandler(services.logger);
    registerAppHandler(services.logger, services.appService, services.windowManager);
    registerSettingsHandler(services.logger, services.settings, services.eventBus, services.appService);
    registerTabHandler(
      services.logger,
      services.windowManager,
      resolveView(ROUTE_MAP.home)
    );
    registerBookmarkHandler(
      services.windowManager,
      services.bookmarkService,
      services.logger
    );
    registerOptionMenuHandler(services.logger, services.windowManager);

    services.eventBus.send("init");
    services.windowManager.create();

    app.on("activate", () => {
      onActivate(services.logger, services.windowManager);
    });

    services.logger.info('Event "ready" has fired sucessfully.');
  } catch (err) {
    services.logger.error(
      new Error('An error occurred during the execution of Event "ready".')
    );
  }
}

function onActivate(logger: Logger, windowManager: WindowManager) {
  logger.info('Event "activate" has started.');

  windowManager.ensure();
}

function onWindowAllClosed(logger: Logger) {
  logger.info('Event "window-all-closed" has started.');

  if (process.platform !== "darwin") {
    app.quit();
  }
}
