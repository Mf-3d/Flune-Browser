import { MenuId } from "../../../shared/types/menu";
import { menuIpc } from "../ipc/menu-ipc";

export function registerClickEvents() {
  const menuItemElements: NodeListOf<HTMLAnchorElement> = document.querySelectorAll("a.menu-item");

  menuItemElements.forEach((element) => {
    element.addEventListener("click", () => {
      const menuId = element.getAttribute("id") as MenuId;

      menuIpc.clickItem(menuId);
    });
  });
}