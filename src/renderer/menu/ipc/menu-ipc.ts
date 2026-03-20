import type { MenuActionDescriptor, MenuPageId } from "../../../shared/types/menu";

export const menuIpc = {
  open() {
    window.flune.menu?.open();
  },

  close() {
    window.flune.menu?.close();
  },

  async getPage(pageId: MenuPageId) {
    return await window.flune.menu?.getPage(pageId);
  },

  clickItem(action: MenuActionDescriptor) {
    window.flune.menu?.clickItem(action);
  },
};