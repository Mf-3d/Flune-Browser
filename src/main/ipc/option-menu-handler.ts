import { IPC_INVOKE } from "@/shared/ipc/channels";
import { ipcMain } from "electron";
import { validateSender } from "./validateSender";
import { OptionMenuController } from "../menu/option-menu/controllers/option-menu-controller";

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
}