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
  
  if (!app.isPackaged) base.nav.webContents.openDevTools({
    mode: "detach"
  });
}

function isArchitectureIntel(): boolean {
  const f = new Float32Array(1);
  const u8 = new Uint8Array(f.buffer);
  f[0] = Infinity;
  f[0] = f[0] - f[0];

  return u8[3] === 255;
}

// Intel Macでエラーが出るのを回避する
if (process.platform === "darwin" && isArchitectureIntel()) app.disableHardwareAcceleration();

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