import { IPC_INVOKE } from "@/shared/ipc/channels";
import { app, BaseWindow, dialog, ipcMain } from "electron";
import { validateSender } from "./validateSender";
import * as packageJson from "@/../package.json";
import { TabManager } from "../window/tab";

export function registerAppHandler(baseWindow: BaseWindow, tabManager: TabManager) {
  ipcMain.handle(IPC_INVOKE.APP_GET_VERSION, (event) => {
    if (!event.senderFrame) return null;
    if (!validateSender(event.senderFrame)) return null;

    return packageJson.version;
  });

  ipcMain.handle(IPC_INVOKE.APP_GET_VERSIONS, (event) => {
    if (!event.senderFrame) return null;
    if (!validateSender(event.senderFrame)) return null;

    return {
      flune: packageJson.version,
      electron: process.versions.electron,
      node: process.versions.node,
      chrome: process.versions.chrome,
      v8: process.versions.v8,
    };
  });

  ipcMain.handle(IPC_INVOKE.APP_GET_COMPUTER_INFO, (event) => {
    if (!event.senderFrame) return null;
    if (!validateSender(event.senderFrame)) return null;

    return {
      arch: process.arch,
      platform: process.platform,
    };
  });

  ipcMain.handle(IPC_INVOKE.APP_UPDATE_SYMBOL_COLOR, (event, color: string) => {
    if (!event.senderFrame) return null;
    if (!validateSender(event.senderFrame)) return null;

    if (process.platform === "win32" || process.platform === "linux")
      baseWindow.setTitleBarOverlay({
        symbolColor: color
      });
  });

  ipcMain.handle(IPC_INVOKE.APP_QUIT, (event, forced: boolean) => {
    if (!event.senderFrame) return null;
    if (!validateSender(event.senderFrame)) return null;

    if (forced) app.quit();
    else {
      const choice = dialog.showMessageBoxSync(baseWindow, {
        type: "question",
        message: "本当に終了しますか？",
        detail: `${tabManager.tabs.length}個のタブを閉じます。`,
        buttons: ["終了する", "キャンセル"],
        defaultId: 0,
        cancelId: 1,
      });

      if (choice === 0) app.quit();
    }
  });
}