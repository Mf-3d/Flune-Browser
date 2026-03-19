import { menuIpc } from "../ipc/menu-ipc";
import { goBack, navigateTo } from "./navigate";

import type { MenuActionDescriptor, MenuActionDescriptorType, MenuPageId } from "../../../shared/types/menu";


export function registerClickEvents() {
  const menuItemElements: NodeListOf<HTMLAnchorElement> = document.querySelectorAll("a.menu-item");

  menuItemElements.forEach((element) => {
    element.addEventListener("click", () => {
      switch (element.dataset.action) {
        case "navigate":
          const menuId: MenuPageId = element.dataset.target as MenuPageId;
          navigateTo(menuId);
          break;
        case "go-back":
          goBack();
          break;
        default:
          const menuAction: MenuActionDescriptor = {
            type: element.dataset.action as MenuActionDescriptorType,
            payload: JSON.parse(element.dataset.payload!)
          };

          menuIpc.clickItem(menuAction);
      }
    });
  });

  document.getElementById("toggle")?.addEventListener("click", () => {
    menuIpc.close();
  });
}