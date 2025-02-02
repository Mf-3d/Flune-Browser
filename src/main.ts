import { 
  app,
  ipcMain
} from "electron";
import { Base } from "./main/base-window";

let base: Base | null | undefined;

// 新規ウィンドウ
function nw() {
  base = new Base();
  base.nav.webContents.once("did-finish-load", () => {
    base?.tabManager?.newTab("https://www.youtube.com");
  });

  // IPCチャンネル
  ipcMain.handle("tab.reload", (event, ignoringCache) => {
    base?.tabManager?.reloadTab(undefined, ignoringCache);
  });
  ipcMain.handle("tab.go-back", () => {
    base?.tabManager?.goBack();
  });
  ipcMain.handle("tab.go-forward", () => {
    base?.tabManager?.goForward();
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