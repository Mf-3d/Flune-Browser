import { ipcMain } from "electron";

import { validateSender } from "@/main/ipc/validateSender";
import { TabManager } from "@/main/tab/tab-manager";
import { IPC_INVOKE } from "@/shared/ipc/channels";

export function registerTabHandler(tabManager: TabManager, homeUrl: string) {
  try {
    ipcMain.handle(IPC_INVOKE.TAB_CREATE, (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      // tabManager.newTab(undefined, {
      //   active: true
      // });
      tabManager.createTab({
        isActive: true
      });
    });

    ipcMain.handle(IPC_INVOKE.TAB_REMOVE, (event, id: string) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      tabManager.removeTab(id);
    });

    ipcMain.handle(IPC_INVOKE.TAB_NAVIGATE, (event, id: string | undefined, word: string) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      // tabManager.load(id, word);
      tabManager.navigate(word, id);
    });

    ipcMain.handle(IPC_INVOKE.TAB_ACTIVATE, (event, id: string) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      tabManager.activateTab(id);
    });

    ipcMain.handle(IPC_INVOKE.TAB_RELOAD, (event, options?: Partial<{
      ignoreCache: boolean
    }>) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      // tabManager.reloadTab(undefined, options?.ignoringCache);
      tabManager.getActiveTab()?.reload(options);
    });

    ipcMain.handle(IPC_INVOKE.TAB_MOVE, (event, id: string, targetId: string, position: "before" | "after") => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      if (position === "after") tabManager.moveAfter(id, targetId);
      else tabManager.moveBefore(id, targetId);
    });

    ipcMain.handle(IPC_INVOKE.TAB_GO_BACK, (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      // tabManager.goBack();
      tabManager.getActiveTab()?.goBack();
    });

    ipcMain.handle(IPC_INVOKE.TAB_GO_FORWARD, (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      // tabManager.goForward();
      tabManager.getActiveTab()?.goForward();
    });

    ipcMain.handle(IPC_INVOKE.TAB_GO_HOME, (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      // tabManager.load(undefined, homeUrl);
      tabManager.navigate(homeUrl);
    });

    ipcMain.handle(IPC_INVOKE.VIEW_FOCUS, (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      // tabManager.getActiveTabCurrent()?.entity.webContents.focus();
      tabManager.getActiveTab()?.webContents.focus();
    });
  } catch (err) {
    console.error("Failed to register tabHandler:", err); // ロガーはまだ入れていないので仮
  }
}