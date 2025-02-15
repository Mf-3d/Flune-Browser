import {
  app
} from "electron";
import { Base } from "./main/base-window";
import { Protocol } from "./main/protocol";

let base: Base | null | undefined;
let protocol: Protocol | null | undefined;

// 新規ウィンドウ
function nw() {
  base = new Base();
  base.nav.webContents.once("did-finish-load", () => {
    base?.tabManager?.newTab();
  });
  if (!app.isPackaged) base.nav.webContents.openDevTools();
}

app.on("ready", () => {
  nw();

  // プロトコルを設定
  protocol = new Protocol("flune");
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});