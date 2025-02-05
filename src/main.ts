import {
  app
} from "electron";
import { Base } from "./main/base-window";

let base: Base | null | undefined;

// 新規ウィンドウ
function nw() {
  base = new Base();
  base.nav.webContents.once("did-finish-load", () => {
    base?.tabManager?.newTab("https://www.youtube.com");
  });
}

app.on("ready", () => {
  nw();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});