import { ipcMain } from "electron";

import { validateSender } from "@/main/ipc/validateSender";
import { IPC_INVOKE } from "@/shared/ipc/channels";

import type { WindowManager } from "@/main/window/window-manager";

export function registerTabHandler(windowManager: WindowManager, homeUrl: string) {
  try {
    ipcMain.handle(IPC_INVOKE.TAB_CREATE, (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      const window = windowManager.getWindowFromWebContents(event.sender);

      if (!window) {
        throw new Error("Window does not exist.");
      }

      window.tabManager.createTab({
        isActive: true
      });
    });

    ipcMain.handle(IPC_INVOKE.TAB_REMOVE, (event, id: string) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      const window = windowManager.getWindowFromWebContents(event.sender);

      if (!window) {
        throw new Error("Window does not exist.");
      }

      window.tabManager.removeTab(id);
    });

    ipcMain.handle(IPC_INVOKE.TAB_NAVIGATE, (event, id: string | undefined, word: string) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      const window = windowManager.getWindowFromWebContents(event.sender);

      if (!window) {
        throw new Error("Window does not exist.");
      }

      window.tabManager.navigate(word, id);
    });

    ipcMain.handle(IPC_INVOKE.TAB_ACTIVATE, (event, id: string) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      const window = windowManager.getWindowFromWebContents(event.sender);

      if (!window) {
        throw new Error("Window does not exist.");
      }

      window.tabManager.activateTab(id);
    });

    ipcMain.handle(IPC_INVOKE.TAB_RELOAD, (event, options?: Partial<{
      ignoreCache: boolean
    }>) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      const window = windowManager.getWindowFromWebContents(event.sender);

      if (!window) {
        throw new Error("Window does not exist.");
      }
      
      window.tabManager.getActiveTab()?.reload(options);
    });

    ipcMain.handle(IPC_INVOKE.TAB_MOVE, (event, id: string, targetId: string, position: "before" | "after") => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      const window = windowManager.getWindowFromWebContents(event.sender);

      if (!window) {
        throw new Error("Window does not exist.");
      }

      if (position === "after") {
        window.tabManager.moveAfter(id, targetId);
      } else {
        window.tabManager.moveBefore(id, targetId);
      }
    });

    ipcMain.handle(IPC_INVOKE.TAB_GO_BACK, (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      const window = windowManager.getWindowFromWebContents(event.sender);

      if (!window) {
        throw new Error("Window does not exist.");
      }
      
      window.tabManager.getActiveTab()?.goBack();
    });

    ipcMain.handle(IPC_INVOKE.TAB_GO_FORWARD, (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      const window = windowManager.getWindowFromWebContents(event.sender);

      if (!window) {
        throw new Error("Window does not exist.");
      }
      
      window.tabManager.getActiveTab()?.goForward();
    });

    ipcMain.handle(IPC_INVOKE.TAB_GO_HOME, (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      const window = windowManager.getWindowFromWebContents(event.sender);

      if (!window) {
        throw new Error("Window does not exist.");
      }
      
      window.tabManager.navigate(homeUrl);
    });

    ipcMain.handle(IPC_INVOKE.VIEW_FOCUS, (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      const window = windowManager.getWindowFromWebContents(event.sender);

      if (!window) {
        throw new Error("Window does not exist.");
      }
      
      window.tabManager.getActiveTab()?.webContents.focus();
    });
  } catch (err) {
    console.error("Failed to register tabHandler:", err); // ロガーはまだ入れていないので仮
  }
}