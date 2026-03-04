import {
  app,
  clipboard,
  Menu
} from "electron";

import { Base } from "@/main/window/base-window";

/**
 * @class
 * @deprecated
 */
export class ContextMenuManager {
  base: Base;

  constructor(base: Base) {
    this.base = base;
  }

  /**
   * @deprecated
   */
  build(state: {
    type: "normal" | "text" | "link" | "image" | "audio" | "video",
    isEditable: boolean,
    canGoBack: boolean,
    canGoForward: boolean,
    params: Electron.ContextMenuParams,
    isNav: boolean
  }): Electron.Menu {
    return Menu.buildFromTemplate(this.createTemplate(state));
  }

  /**
   * @deprecated
   */
  createTemplate(state: {
    type: "normal" | "text" | "link" | "image" | "audio" | "video",
    isEditable: boolean,
    canGoBack: boolean,
    canGoForward: boolean,
    params: Electron.ContextMenuParams,
    isNav: boolean
  }): Electron.MenuItemConstructorOptions[] {
    const TEMPLATE_EMOJI: Electron.MenuItemConstructorOptions[] = (process.platform === "win32") ? [
      {
        label: "絵文字",
        accelerator: "Super+.",
        click: () => {
          app.showEmojiPanel();
        }
      },
      {
        type: "separator"
      }
    ] : [
      {
        label: "絵文字",
        click: () => {
          app.showEmojiPanel();
        }
      },
      {
        type: "separator"
      }
    ] as Electron.MenuItemConstructorOptions[];

    const TEMPLATE_VIDEO: Electron.MenuItemConstructorOptions[] = [
      {
        label: "ピクチャーインピクチャー",
        click: () => {
          this.base.tabManager?.getActiveTabCurrent()?.entity.webContents.executeJavaScript(`(document.activeElement.tagName === "video") ? document.activeElement.requestPictureInPicture() : document.activeElement.querySelector("video").requestPictureInPicture();`);
        }
      },
      {
        type: "separator"
      }
    ];

    const TEMPLATE_EDITABLE: Electron.MenuItemConstructorOptions[] = [
      {
        label: "元に戻す",
        role: "undo"
      },
      {
        label: "やり直す",
        role: "redo"
      },
      {
        type: "separator"
      },
      {
        label: "すべて選択",
        role: "selectAll",
        enabled: state.params.selectionText !== ""
      },
      {
        label: "切り取り",
        role: "cut",
        enabled: state.params.selectionText !== ""
      },
      {
        label: "コピー",
        role: "copy",
        enabled: state.params.selectionText !== ""
      },
      {
        label: "貼り付け",
        role: "paste"
      },
      {
        label: "削除",
        role: "delete",
        enabled: state.params.selectionText !== ""
      },
      {
        type: "separator"
      }
    ];

    const TEMPLATE_TEXT: Electron.MenuItemConstructorOptions[] = [
      {
        label: "コピー",
        role: "copy",
        enabled: state.params.selectionText !== ""
      },
      {
        label: `「${state.params.selectionText}」を検索`,
        click: () => {
          this.base.tabManager?.newTab(state.params.selectionText, {
            active: true
          })
        }
      },
      {
        type: "separator"
      },
    ];

    const TEMPLATE_LINK: Electron.MenuItemConstructorOptions[] = [
      {
        label: "新しいタブで開く",
        click: () => {
          this.base.tabManager?.newTab(state.params.linkURL);
        }
      },
      {
        label: "リンクのアドレスをコピー",
        click() {
          clipboard.writeText(state.params.linkURL);
        }
      },
      {
        type: "separator"
      },
    ];

    const TEMPLATE_NAV: Electron.MenuItemConstructorOptions[] = [
      {
        label: "新しいタブ",
        accelerator: "Ctrl+T",
        click: () => {
          this.base.tabManager?.newTab(undefined, {
            active: true
          });
        }
      },
      {
        type: "separator"
      },
      {
        label: "ナビゲーションの開発者ツールを表示",
        click: () => {
          this.base.nav.webContents.toggleDevTools();
        }
      },
      {
        label: "設定",
        click: () => {
          this.base.tabManager?.settings.openSettingsAsTab();
        }
      }
    ];

    const TEMPLATE_VIEW: Electron.MenuItemConstructorOptions[] = [
      {
        label: "戻る",
        accelerator: "Alt+Left",
        enabled: state.canGoBack,
        click: () => {
          this.base.tabManager?.goBack();
        }
      },
      {
        label: "進む",
        accelerator: "Alt+Right",
        enabled: state.canGoForward,
        click: () => {
          this.base.tabManager?.goForward();
        }
      },
      {
        label: "再読み込み",
        accelerator: "CmdOrCtrl+R",
        click: () => {
          this.base.tabManager?.reloadTab();
        }
      },
      {
        type: "separator"
      },
      {
        label: "ページのソースを表示",
        accelerator: "Ctrl+U",
        click: () => {
          this.base.tabManager?.newTab(`view-source:${this.base.tabManager?.getActiveTabCurrent()?.entity.webContents.getURL()}`);
        }
      },
      (process.platform === "darwin" ? {
        label: "開発者ツールを表示",
        accelerator: "Cmd+Option+I", // macOSのみ
        click: () => {
          this.base.tabManager?.toggleDevTools();
        }
      } : {
        label: "開発者ツールを表示",
        accelerator: "F12", // WindowsとLinux
        click: () => {
          this.base.tabManager?.toggleDevTools();
        }
      })
    ];

    let template: Electron.MenuItemConstructorOptions[] = [];

    if (state.isEditable && process.platform !== "linux") template.push(...TEMPLATE_EMOJI);
    if (state.type === "video") template.push(...TEMPLATE_VIDEO);
    if (state.isEditable) template.push(...TEMPLATE_EDITABLE);
    else {
      if (state.type === "text") template.push(...TEMPLATE_TEXT);
      if (state.type === "link") template.push(...TEMPLATE_LINK);
    };
    if (state.isNav) template.push(...TEMPLATE_NAV);
    else template.push(...TEMPLATE_VIEW);

    return template;
  }
};

/**
 * @deprecated
 */
export function buildTabContextMenu(base: Base, tabId: string): Electron.Menu {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: "右隣に新しいタブを開く",
      click() {
        let tabPosition = base.tabManager?.getTabPositionById(tabId);

        if (typeof tabPosition === "number") {
          base.tabManager?.newTab(undefined, {
            active: true,
            position: tabPosition + 1
          });
        } else {
          console.error("Could not open new tab: Unable to retrieve tab positions.");
        }
      }
    },
    {
      type: "separator"
    },
    {
      label: "再読み込み",
      accelerator: "CmdOrCtrl+R",
      click() {
        base.tabManager?.reloadTab(tabId);
      }
    },
    {
      label: "タブを複製",
      click() {
        let tab = base.tabManager?.getTabById(tabId);

        if (!tab) {
          console.error("Failed to duplicate tab: Tab does not exist.");

          return;
        }

        let tabPosition = base.tabManager?.getTabPositionById(tabId);

        if (typeof tabPosition === "number") {
          base.tabManager?.newTab(tab?.entity.webContents.getURL(), {
            active: true,
            position: tabPosition + 1
          });
        }
      }
    },
    {
      type: "separator"
    },
    {
      label: "閉じる",
      click() {
        base.tabManager?.removeTab(tabId);
      }
    }
  ];

  const menu = Menu.buildFromTemplate(template);

  return menu;
}