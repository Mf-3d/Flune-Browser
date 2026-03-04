import { app } from "electron";
import { registerCrashHandler } from "@/main/infrastructure/crash-handler";
import { Protocol } from "@/main/protocol";
import Event from "@/main/lib/event";
import { isArchitectureIntel } from "@/main/system/env";
import { DataManager } from "@/main/lib/data";
import { WindowManager } from "@/main/window/window-manager";
import { BookmarkService } from "@/main/bookmark/service";
import { Settings, createSettings } from "./settings/";

type Services = {
  settings: Settings;
  windowManager: WindowManager;
  data: DataManager;
  event: Event;
  bookmarkService: BookmarkService;
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
  const settings = createSettings(event);
  const windowManager = new WindowManager(settings);
  const bookmarkService = new BookmarkService(data);

  return {
    settings,
    windowManager,
    data,
    event,
    bookmarkService,
  };
}

function onReady(services: Services) {
  const protocol = new Protocol("flune");

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