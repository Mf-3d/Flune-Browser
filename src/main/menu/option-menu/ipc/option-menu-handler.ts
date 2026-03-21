import { IPC_INVOKE } from "@/shared/ipc/channels";
import { handle } from "@/main/ipc/handler";

import type { WindowManager } from "@/main/window/window-manager";
import type { MenuActionDescriptor, MenuPageId } from "@/shared/types/menu";

export function registerOptionMenuHandler(windowManager: WindowManager) {
  handle(IPC_INVOKE.MENU_OPEN, (event) => {
    const window = windowManager.getWindowFromWebContents(event.sender);

    if (!window) {
      throw new Error("Window does not exist.");
    }

    window.optionMenuController.open();
  });

  handle(IPC_INVOKE.MENU_CLOSE, (event) => {
    const window = windowManager.getWindowFromWebContents(event.sender);

    if (!window) {
      throw new Error("Window does not exist.");
    }

    window.optionMenuController.close();
  });

  handle(IPC_INVOKE.MENU_GET_PAGE, (event, pageId: MenuPageId) => {
    const window = windowManager.getWindowFromWebContents(event.sender);

    if (!window) {
      throw new Error("Window does not exist.");
    }

    return window.optionMenuController.getPage(pageId);
  });

  handle(IPC_INVOKE.MENU_TOGGLE, (event) => {
    const window = windowManager.getWindowFromWebContents(event.sender);

    if (!window) {
      throw new Error("Window does not exist.");
    }

    window.optionMenuController.toggle();
  });

  handle(IPC_INVOKE.MENU_ITEM_CLICKED, (event, action: MenuActionDescriptor) => {
    const window = windowManager.getWindowFromWebContents(event.sender);

    if (!window) {
      throw new Error("Window does not exist.");
    }

    window.optionMenuController.handleClick(action);
  });
}
