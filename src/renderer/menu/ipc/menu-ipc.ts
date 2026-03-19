import { MenuActionDescriptor } from "../../../shared/types/menu";

export const menuIpc = {
  open() {
    window.flune.menu?.open();
  },

  close() {
    window.flune.menu?.close();
  },

  clickItem(action: MenuActionDescriptor) {
    window.flune.menu?.clickItem(action);
  },
};