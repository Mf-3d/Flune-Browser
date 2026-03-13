import { IPC_INVOKE } from "@/shared/ipc/channels";
import { ipcMain } from "electron";
import { validateSender } from "@/main/ipc/validateSender";
import { OptionMenuController } from "../controllers/option-menu-controller";
import { MenuId } from "../templates/types";

export function registerOptionMenuHandler(optionMenuController: OptionMenuController) {
  ipcMain.handle(IPC_INVOKE.MENU_OPEN, (event) => {
    if (!event.senderFrame) return null;
    if (!validateSender(event.senderFrame)) return null;

    optionMenuController.open();
  });

  ipcMain.handle(IPC_INVOKE.MENU_CLOSE, (event) => {
    if (!event.senderFrame) return null;
    if (!validateSender(event.senderFrame)) return null;

    optionMenuController.close();
  });

  ipcMain.handle(IPC_INVOKE.MENU_ITEM_CLICK, (event, menuId: MenuId) => {
    if (!event.senderFrame) return null;
    if (!validateSender(event.senderFrame)) return null;
    
    optionMenuController.handleClick(menuId);
  });
}