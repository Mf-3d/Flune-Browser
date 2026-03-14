import { app } from "electron";
import { registerCrashHandler } from "@/main/infrastructure/crash-handler";
import { Protocol } from "@/main/infrastructure/protocol";
import Event from "@/main/lib/event";
import { isArchitectureIntel } from "@/main/system/env";
import { DataManager } from "@/main/lib/data";
import { WindowManager } from "@/main/window/window-manager";
import { BookmarkService } from "@/main/bookmark/service";
import { Settings, createSettings } from "./settings/";

import { registerTabHandler } from "@/main/tab/ipc/tab-handler";
import { resolveView, ROUTE_MAP } from "@/shared/resolveView";
import { registerSettingsHandler } from "./settings/ipc/settings-handler";
import { registerBookmarkHandler } from "./bookmark/ipc/bookmark-handler";
import { registerAppHandler } from "@/main/application/ipc/app-handler";
import { ApplicationService } from "./application/application-service";

type Services = {
  settings: Settings;
  windowManager: WindowManager;
  data: DataManager;
  event: Event;
  bookmarkService: BookmarkService;
  appService: ApplicationService;
  protocol: Protocol;
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
  const event = new Event();
  const appService = new ApplicationService();
  const settings = createSettings();
  const windowManager = new WindowManager(appService, settings);
  const bookmarkService = new BookmarkService(data);
  const protocol = new Protocol("flune", event);

  return {
    settings,
    windowManager,
    data,
    event,
    bookmarkService,
    appService,
    protocol
  };
}

function onReady(services: Services) {

  registerAppHandler(services.appService, services.windowManager);
  registerSettingsHandler(services.settings, services.event);
  registerTabHandler(services.windowManager, resolveView(ROUTE_MAP.home));
  registerBookmarkHandler(services.windowManager, services.data);

  services.event.send("init");
  services.windowManager.create(services.event, services.data);

  app.on("activate", () => {
    services.windowManager.ensure(services.event, services.data);
  });
}

function handleWindowAllClosed() {
  if (process.platform !== "darwin") {
    app.quit();
  }
}