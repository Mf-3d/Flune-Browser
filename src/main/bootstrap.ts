import { app } from "electron";
import { registerCrashHandler } from "@/main/infrastructure/crash-handler";
import { Protocol } from "@/main/infrastructure/protocol";
import { isArchitectureIntel } from "@/main/system/env";
import { DataManager } from "@/main/lib/data";
import { WindowManager } from "@/main/window/window-manager";
import { BookmarkService } from "@/main/bookmark/service";
import { Settings, createSettings } from "./settings/";
import { EventBus } from "./infrastructure/event/event-bus";

import { registerTabHandler } from "@/main/tab/ipc/tab-handler";
import { resolveView, ROUTE_MAP } from "@/shared/resolveView";
import { registerSettingsHandler } from "./settings/ipc/settings-handler";
import { registerBookmarkHandler } from "./bookmark/ipc/bookmark-handler";
import { registerAppHandler } from "@/main/application/ipc/app-handler";
import { ApplicationService } from "./application/application-service";
import { registerOptionMenuHandler } from "./menu/option-menu/ipc/option-menu-handler";

type Services = {
  settings: Settings;
  windowManager: WindowManager;
  data: DataManager;
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
  const data = new DataManager;
  const eventBus = new EventBus;
  const appService = new ApplicationService;
  const settings = createSettings();
  const windowManager = new WindowManager(appService, settings, eventBus);
  const bookmarkService = new BookmarkService(data);

  return {
    settings,
    windowManager,
    data,
    eventBus,
    bookmarkService,
    appService,
  };
}

function onReady(services: Services) {
  const protocol = new Protocol("flune");

  registerAppHandler(services.appService, services.windowManager);
  registerSettingsHandler(services.settings, services.eventBus);
  registerTabHandler(services.windowManager, resolveView(ROUTE_MAP.home));
  registerBookmarkHandler(services.windowManager, services.data);
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