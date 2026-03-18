import { MenuId } from "../../../shared/types/menu";

export const menuIpc = {
  open() {
    window.flune.menu?.open();
  },

  close() {
    window.flune.menu?.close();
  },

  clickItem(menuId: MenuId) {
    window.flune.menu?.clickItem(menuId);
  },
};