import { ipcMain } from "electron";

import { validateSender } from "@/main/ipc/validateSender";
import { TabManager } from "@/main/window/tab";
import { IPC_INVOKE } from "@/shared/ipc/channels";

export function registerTabHandler(tabManager: TabManager, homeUrl: string) {
  try {
    ipcMain.handle(IPC_INVOKE.TAB_CREATE, (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      tabManager.newTab(undefined, {
        active: true
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

      tabManager.load(id, word);
    });

    ipcMain.handle(IPC_INVOKE.TAB_ACTIVATE, (event, id: string) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      tabManager.activateTab(id);
    });

    ipcMain.handle(IPC_INVOKE.TAB_RELOAD, (event, options?: {
      ignoringCache?: boolean
    }) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      tabManager.reloadTab(undefined, options?.ignoringCache);
    });

    ipcMain.handle(IPC_INVOKE.TAB_MOVE, (event, from: number, to: number) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      tabManager.moveTab(from, to);
    });

    ipcMain.handle(IPC_INVOKE.TAB_GO_BACK, (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      tabManager.goBack();
    });

    ipcMain.handle(IPC_INVOKE.TAB_GO_FORWARD, (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      tabManager.goForward();
    });

    ipcMain.handle(IPC_INVOKE.TAB_GO_HOME, (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      tabManager.load(undefined, homeUrl);
    });

    ipcMain.handle(IPC_INVOKE.VIEW_FOCUS, (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      tabManager.getActiveTabCurrent()?.entity.webContents.focus();
    });
  } catch (err) {
    console.error("Failed to register tabHandler:", err); // ロガーはまだ入れていないので仮
  }
}