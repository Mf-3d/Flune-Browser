import { handle } from "@/main/ipc/handler";
import { IPC_INVOKE } from "@/shared/ipc/channels";

import type { WindowManager } from "@/main/window/window-manager";

export function registerTabHandler(windowManager: WindowManager, homeUrl: string) {
  try {
    handle(IPC_INVOKE.TAB_CREATE, (event) => {
      const window = windowManager.getWindowFromWebContents(event.sender);

      if (!window) {
        throw new Error("Window does not exist.");
      }

      window.tabManager.createTab({
        isActive: true
      });
    });

    handle(IPC_INVOKE.TAB_REMOVE, (event, id: string) => {
      const window = windowManager.getWindowFromWebContents(event.sender);

      if (!window) {
        throw new Error("Window does not exist.");
      }

      window.tabManager.removeTab(id);
    });

    handle(IPC_INVOKE.TAB_NAVIGATE, (event, id: string | undefined, word: string) => {
      const window = windowManager.getWindowFromWebContents(event.sender);

      if (!window) {
        throw new Error("Window does not exist.");
      }

      window.tabManager.navigate(word, id);
    });

    handle(IPC_INVOKE.TAB_ACTIVATE, (event, id: string) => {
      const window = windowManager.getWindowFromWebContents(event.sender);

      if (!window) {
        throw new Error("Window does not exist.");
      }

      window.tabManager.activateTab(id);
    });

    handle(IPC_INVOKE.TAB_RELOAD, (event, options?: Partial<{
      ignoreCache: boolean
    }>) => {
      const window = windowManager.getWindowFromWebContents(event.sender);

      if (!window) {
        throw new Error("Window does not exist.");
      }
      
      window.tabManager.getActiveTab()?.reload(options);
    });

    handle(IPC_INVOKE.TAB_MOVE, (event, id: string, targetId: string, position: "before" | "after") => {
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

    handle(IPC_INVOKE.TAB_GO_BACK, (event) => {
      const window = windowManager.getWindowFromWebContents(event.sender);

      if (!window) {
        throw new Error("Window does not exist.");
      }
      
      window.tabManager.getActiveTab()?.goBack();
    });

    handle(IPC_INVOKE.TAB_GO_FORWARD, (event) => {
      const window = windowManager.getWindowFromWebContents(event.sender);

      if (!window) {
        throw new Error("Window does not exist.");
      }
      
      window.tabManager.getActiveTab()?.goForward();
    });

    handle(IPC_INVOKE.TAB_GO_HOME, (event) => {
      const window = windowManager.getWindowFromWebContents(event.sender);

      if (!window) {
        throw new Error("Window does not exist.");
      }
      
      window.tabManager.navigate(homeUrl);
    });

    handle(IPC_INVOKE.VIEW_FOCUS, (event) => {
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