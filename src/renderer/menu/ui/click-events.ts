import { menuIpc } from "../ipc/menu-ipc";
import { goBack, navigateTo } from "./navigate";

import type { MenuActionDescriptorType, MenuPageId } from "../../../shared/types/menu";
import { defaultIpc } from "@/renderer/ipc/default-ipc";

export function registerClickEvents() {
  defaultIpc.logger.debug("[MENU] Click event registration has started.");

  const menuItemElements: NodeListOf<HTMLAnchorElement> =
    document.querySelectorAll("a.menu-item");

  menuItemElements.forEach((element) => {
    element.addEventListener("click", () => {
      if (element.classList.contains("disabled")) return;

      switch (element.dataset.action) {
        case "navigate":
          navigateTo(element.dataset.target as MenuPageId);
          break;
        case "go-back":
          goBack();
          break;
        default:
          menuIpc.clickItem({
            type: element.dataset.action as MenuActionDescriptorType,
            payload: JSON.parse(element.dataset.payload!),
          });
      }
    });
  });

  document.getElementById("toggle")?.addEventListener("click", () => {
    menuIpc.close();
  });

  defaultIpc.logger.debug("[MENU] Click event registration has completed.");
}
