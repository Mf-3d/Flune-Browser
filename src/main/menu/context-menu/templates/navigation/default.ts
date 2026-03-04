import { ContextMenuActions } from "@/main/menu/context-menu/controllers/context-menu-controller";

export function createNavigationMenuTemplate(actions: ContextMenuActions): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: "新しいタブ",
      accelerator: "Ctrl+T",
      click: actions.newTab
    },
    {
      type: "separator"
    },
    {
      label: "ナビゲーションの開発者ツールを表示",
      click: actions.toggleNavigationDevTools
    },
    {
      label: "設定",
      click: actions.openSettings
    },
  ];
}