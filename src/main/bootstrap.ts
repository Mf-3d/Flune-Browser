import { app } from "electron";
import { registerCrashHandler } from "@/main/infrastructure/crashHandler";
import { Protocol } from "@/main/protocol";
import Event from "@/main/lib/event";
import { isArchitectureIntel } from "@/main/system/env";
import { DataManager } from "@/main/lib/data";
import { WindowManager } from "@/main/window/windowManager";
import { BookmarkService } from "@/main/bookmark/service";

type Services = {
  windowManager: WindowManager,
  data: DataManager,
  event: Event,
  bookmarkService: BookmarkService,
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
  const windowManager = new WindowManager();
  const data = new DataManager;
  const event = new Event();
  const bookmarkService = new BookmarkService(data);

  return {
    windowManager,
    data,
    event,
    bookmarkService,
  };
}

function onReady(services: Services) {
  const protocol = new Protocol("flune");

  services.event.send("init");
  services.windowManager.create(services.bookmarkService, services.event, services.data);

  app.on("activate", () => {
    services.windowManager.ensure(services.bookmarkService, services.event, services.data);
  });
}

function handleWindowAllClosed() {
  if (process.platform !== "darwin") {
    app.quit();
  }
}