import { ContextMenuActions } from "@/main/menu/context-menu/controllers/context-menu-controller";

export function createNavigationMenuTemplate(actions: ContextMenuActions): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: "新しいタブ",
      accelerator: "Ctrl+T",
      // click: () => {
      //   this.base.tabManager?.newTab(undefined, {
      //     active: true
      //   });
      // }
      click: actions.newTab
    },
    {
      type: "separator"
    },
    {
      label: "ナビゲーションの開発者ツールを表示",
      // click: () => {
      //   this.base.nav.webContents.toggleDevTools();
      // }
      click: actions.toggleNavigationDevTools
    },
    {
      label: "設定",
      // click: () => {
      //   this.base.tabManager?.settings.openSettingsAsTab();
      // }
      click: actions.openSettings
    },
  ];
}