import { IPC_INVOKE } from "@/shared/ipc/channels";
import { app, dialog } from "electron";
import * as packageJson from "@/../package.json";
import { WindowManager } from "../window/window-manager";
import { handle } from "./handler";
import { resolveView, ROUTE_MAP } from "@/shared/resolveView";

const SETTINGS_URL = resolveView(ROUTE_MAP.settings);
const VERSIONS_URL = resolveView(ROUTE_MAP.version);

export function registerAppHandler(windowManager: WindowManager) {
  handle(IPC_INVOKE.APP_GET_VERSION, () => {
    return packageJson.version;
  });

  handle(IPC_INVOKE.APP_GET_VERSIONS, () => {
    return {
      flune: packageJson.version,
      electron: process.versions.electron,
      node: process.versions.node,
      chrome: process.versions.chrome,
      v8: process.versions.v8,
    };
  });

  handle(IPC_INVOKE.APP_GET_COMPUTER_INFO, () => {
    return {
      arch: process.arch,
      platform: process.platform,
    };
  });

  handle(IPC_INVOKE.APP_UPDATE_SYMBOL_COLOR, (event, color: string) => {
    if (process.platform === "win32" || process.platform === "linux") {
      const window = windowManager.getWindowFromWebContents(event.sender);

      if (!window) {
        throw new Error("Window does not exist.");
      }

      window.win.setTitleBarOverlay({
        symbolColor: color
      });
    }
  });

  handle(IPC_INVOKE.APP_SHOW_SETTINGS_PAGE, (event) => {
    const window = windowManager.getWindowFromWebContents(event.sender);

    if (!window) {
      throw new Error("Window does not exist.");
    }

    window.tabManager.navigate(SETTINGS_URL);
  });

  handle(IPC_INVOKE.APP_SHOW_VERSIONS_PAGE, (event) => {
    const window = windowManager.getWindowFromWebContents(event.sender);

    if (!window) {
      throw new Error("Window does not exist.");
    }

    window.tabManager.navigate(VERSIONS_URL);
  });

  handle(IPC_INVOKE.APP_QUIT, (event, forced: boolean) => {
    if (forced) app.quit();
    else {
      const window = windowManager.getWindowFromWebContents(event.sender);

      if (!window) {
        throw new Error("Window does not exist.");
      }

      const choice = dialog.showMessageBoxSync(window.win, {
        type: "question",
        message: "本当に終了しますか？",
        detail: `${window.tabManager.length}個のタブを閉じます。`,
        buttons: ["終了する", "キャンセル"],
        defaultId: 0,
        cancelId: 1,
      });

      if (choice === 0) app.quit();
    }
  });
}