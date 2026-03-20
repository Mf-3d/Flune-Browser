import { app } from "electron";
import { registerCrashHandler } from "@/main/infrastructure/crash-handler";
import { Protocol } from "./protocols/AppProtocol";
import { isArchitectureIntel } from "@/main/system/env";
import { WindowManager } from "@/main/window/window-manager";
import { BookmarkService } from "@/main/bookmark/service";
import { Settings, createSettings } from "./settings/";
import { EventBus } from "./infrastructure/event/event-bus";

import { resolveView, ROUTE_MAP } from "@/shared/resolveView";
import { registerTabHandler } from "@/main/tab/ipc/tab-handler";
import { registerSettingsHandler } from "./settings/ipc/settings-handler";
import { registerBookmarkHandler } from "./bookmark/ipc/bookmark-handler";
import { registerAppHandler } from "@/main/application/ipc/app-handler";
import { ApplicationService } from "./application/application-service";
import { registerOptionMenuHandler } from "./menu/option-menu/ipc/option-menu-handler";
import { DataStore } from "./infrastructure/storage/data-store";
import { BookmarkRepository } from "./bookmark/repository";

type Services = {
  protocol: Protocol;
  settings: Settings;
  windowManager: WindowManager;
  data: DataStore;
  eventBus: EventBus;
  bookmarkService: BookmarkService;
  appService: ApplicationService;
};

export function bootstrap() {
  app.setName("Flune-Browser");
  if (process.platform === "darwin" && isArchitectureIntel()) app.disableHardwareAcceleration();

  registerCrashHandler();
  const services = initializeServices();
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

function initializeServices(): Services {
  const protocol = new Protocol("flune");
  const data = new DataStore;
  const eventBus = new EventBus;

  const bookmarkRepository = new BookmarkRepository(data);

  const bookmarkService = new BookmarkService(bookmarkRepository, eventBus);
  const appService = new ApplicationService(bookmarkService);

  const settings = createSettings(appService);
  const windowManager = new WindowManager(appService, bookmarkService, settings, eventBus);

  return {
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
  registerAppHandler(services.appService, services.windowManager);
  registerSettingsHandler(services.settings, services.eventBus);
  registerTabHandler(services.windowManager, resolveView(ROUTE_MAP.home));
  registerBookmarkHandler(services.windowManager, services.bookmarkService);
  registerOptionMenuHandler(services.windowManager);

  services.protocol.handle();
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