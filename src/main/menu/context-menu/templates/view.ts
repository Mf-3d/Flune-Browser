import { ContextMenuActions } from "@/main/menu/context-menu/controllers/context-menu-controller";

export function createViewMenuTemplate(
  state: {
    canGoBack: boolean,
    canGoForward: boolean
  },
  actions: ContextMenuActions
): Electron.MenuItemConstructorOptions[] {
  return [
    {
      label: "戻る",
      accelerator: "Alt+Left",
      enabled: state.canGoBack,
      click: actions.goBack
    },
    {
      label: "進む",
      accelerator: "Alt+Right",
      enabled: state.canGoForward,
      click: actions.goForward
    },
    {
      label: "再読み込み",
      accelerator: "CmdOrCtrl+R",
      click: actions.reloadTab
    },
    {
      type: "separator"
    },
    {
      label: "ページのソースを表示",
      accelerator: "Ctrl+U",
      click: actions.viewSource
    },
    {
      label: "開発者ツールを表示",
      accelerator: process.platform === "darwin" ? "Cmd+Option+I": "F12",
      click: actions.toggleDevTools
    }
  ];
}