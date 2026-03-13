import { IPC_INVOKE } from "@/shared/ipc/channels";
import { handle } from "@/main/ipc/handler";

import type { OptionMenuController } from "../controllers/option-menu-controller";
import type { MenuId } from "../templates/types";

export function registerOptionMenuHandler(optionMenuController: OptionMenuController) {
  handle(IPC_INVOKE.MENU_OPEN, () => {
    optionMenuController.open();
  });

  handle(IPC_INVOKE.MENU_CLOSE, () => {
    optionMenuController.close();
  });

  handle(IPC_INVOKE.MENU_TOGGLE, () => {
    optionMenuController.toggle();
  });

  handle(IPC_INVOKE.MENU_ITEM_CLICK, (_, menuId: MenuId) => {
    optionMenuController.handleClick(menuId);
  });
}