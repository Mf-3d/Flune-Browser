import {
  app
} from "electron";
import { Base } from "./main/base-window";
import { Protocol } from "./main/protocol";
import Event from "./main/lib/event";
import path from "node:path";
import fs from "fs";

const LOG_DIR = app.getPath("userData");
const LOG_FILE = path.join(LOG_DIR, "app-crash.log");

let base: Base | null | undefined;
let protocol: Protocol | null | undefined;
let event = new Event();

app.setName("Flune-Browser");

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

// Intel Macでエラーが出るのを回避する
function isArchitectureIntel(): boolean {
  const f = new Float32Array(1);
  const u8 = new Uint8Array(f.buffer);
  f[0] = Infinity;
  f[0] = f[0] - f[0];

  return u8[3] === 255;
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

// クラッシュ時にログを保存する。
function log(message: string) {
  fs.appendFileSync(
    LOG_FILE,
    `[${new Date().toISOString()}] ${message}\n`
  );
}

process.on("uncaughtException", (err) => {
  log(`UNCAUGHT: ${err.stack || err.message}`);
});

app.on("render-process-gone", (event, webContents, details) => {
  log(`RENDERER GONE: ${details.reason}`);
});