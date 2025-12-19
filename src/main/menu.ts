import {
  app,
  clipboard,
  Menu,
  shell
} from "electron";

import { Base } from "./base-window";
import { DataManager } from "./lib/data";


const data = new DataManager;

export { buildApplicationMenu } from "./menu/application-menu";
export { ContextMenuManager, buildTabContextMenu } from "./menu/context-menu";

export function buildOptionsMenu(base: Base): Electron.Menu {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: "新しいタブ",
      accelerator: "Ctrl+T",
      click() {
        base.tabManager?.newTab(undefined, {
          active: true
        });
      }
    },
    {
      type: "separator"
    },
    {
      label: "履歴",
      submenu: [
        ...data.histories.getAll().reverse().slice(0, 10).map(history => {
          return {
            label: history.title,
            click() {
              base.tabManager?.load(undefined, history.url);
            }
          }
        }),
        {
          type: "separator"
        },
        {
          label: "全ての履歴を見る",
          enabled: false,
          click() {
            // base.tabManager?.newTab(null)
          },
        },
      ]
    },
    {
      label: "ダウンロード",
      enabled: false,
      submenu: []
    },
    {
      label: "ブックマーク",
      // enabled: false,
      submenu: [
        ...data.bookmarks.folders.getStuff("root").map(entity => {
          if (entity.type === "bookmark") {
            return {
              label: entity.title,
              click() {
                base.tabManager?.load(undefined, entity.url);
              }
            }
          } else {
            return {
              label: entity.title,
              submenu: []
            };
          }
        }),
        {
          type: "separator"
        },
        {
          label: "全てのブックマークを見る",
          enabled: false,
          click() {
            // base.tabManager?.newTab(null)
          },
        },
      ]
    },
    {
      type: "separator"
    },
    {
      label: "設定",
      click() {
        base.tabManager?.settings.openSettingsAsTab();
      }
    },
    {
      label: "終了",
      role: "quit"
    }
  ];

  const menu = Menu.buildFromTemplate(template);

  return menu;
}