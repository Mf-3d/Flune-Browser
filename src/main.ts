import {
  app
} from "electron";
import { Base } from "./main/base-window";
import { Protocol } from "./main/protocol";
import Event from "./main/event";

let base: Base | null | undefined;
let protocol: Protocol | null | undefined;
let event = new Event();

// 新規ウィンドウ
function nw() {
  base = new Base();
  event.once("navigation-loaded", () => {
    base?.tabManager?.newTab();
  });
  
  if (!app.isPackaged) base.nav.webContents.openDevTools();
}

app.on("ready", () => {
  event.send("init");

  nw();

  // プロトコルを設定
  protocol = new Protocol("flune");
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});