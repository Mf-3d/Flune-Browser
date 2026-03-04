import {
  app
} from "electron";
import { Base } from "@/main/window/base-window";
import { Protocol } from "@/main/protocol";
import Event from "@/main/lib/event";
import { BookmarkService } from "@/main/bookmark/service";
import { DataManager } from "@/main/lib/data";
import { registerCrashHandler } from "@/main/infrastructure/crashHandler";
import { isArchitectureIntel } from "@/main/system/env";

let base: Base | null | undefined;
let protocol: Protocol | null | undefined;
const data = new DataManager;
const event = new Event();

const bookmarkService = new BookmarkService(data);
registerCrashHandler();

app.setName("Flune-Browser");

// 新規ウィンドウ
function nw() {
  base = new Base(bookmarkService, data);
  event.once("navigation-loaded", () => {
    base?.tabManager?.newTab();
  });

  if (!app.isPackaged) base.nav.webContents.openDevTools({
    mode: "detach"
  });
}

if (process.platform === "darwin" && isArchitectureIntel()) app.disableHardwareAcceleration();

app.on("ready", () => {
  event.send("init");

  nw();

  // プロトコルを設定
  protocol = new Protocol("flune");

  app.on("activate", () => {
    if (base?.win.isDestroyed()) nw();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});