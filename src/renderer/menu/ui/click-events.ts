import { MenuActionDescriptor, MenuActionDescriptorType } from "../../../shared/types/menu";
import { menuIpc } from "../ipc/menu-ipc";

export function registerClickEvents() {
  const menuItemElements: NodeListOf<HTMLAnchorElement> = document.querySelectorAll("a.menu-item");

  menuItemElements.forEach((element) => {
    element.addEventListener("click", () => {
      const menuAction: MenuActionDescriptor = {
        type: element.dataset.action as MenuActionDescriptorType,
        payload: JSON.parse(element.dataset.payload!)
      };

      menuIpc.clickItem(menuAction);
    });
  });
}