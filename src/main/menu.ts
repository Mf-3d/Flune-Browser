import {
  app,
  Menu,
  shell
} from "electron";

import { Base } from "./base-window";

export function buildApplicationMenu(base: Base): Electron.Menu {
  const template: Electron.MenuItemConstructorOptions[] = [
    ...(process.platform === "darwin" ? [{
      label: app.name,
      submenu: [
        { role: "about", label: `${app.name}について` },
        { type: "separator" },
        { role: "services", label: "サービス" },
        { type: "separator" },
        { role: "hide", label: `${app.name}を隠す` },
        { role: "hideothers", label: "ほかを隠す" },
        { role: "unhide", label: "すべて表示" },
        { type: "separator" },
        { role: "quit", label: `${app.name}を終了` }
      ]
    }] as Electron.MenuItemConstructorOptions[] : [] as Electron.MenuItemConstructorOptions[]),
    {
      label: "ファイル",
      submenu: [
        {
          label: "新しいタブ",
          accelerator: "CmdOrCtrl+T",
          click() {
            base.tabManager?.newTab();
          },
        },
        process.platform === "darwin" ? { role: "close", label: "ウィンドウを閉じる" } : { role: "quit", label: "終了" }
      ]
    },
    {
      label: "編集",
      submenu: [
        { role: "undo", label: "元に戻す" },
        { role: "redo", label: "やり直す" },
        { type: "separator" },
        { role: "cut", label: "切り取り" },
        { role: "copy", label: "コピー" },
        { role: "paste", label: "貼り付け" },
        ...(process.platform === "darwin" ? [
          { role: "pasteAndMatchStyle", label: "ペーストしてスタイルを合わせる" },
          { role: "delete", label: "削除" },
          { role: "selectAll", label: "すべてを選択" },
          { type: "separator" },
          {
            label: "スピーチ",
            submenu: [
              { role: "startSpeaking", label: "読み上げを開始" },
              { role: "stopSpeaking", label: "読み上げを停止" }
            ]
          }
        ] as Electron.MenuItemConstructorOptions[] : [
          { role: "delete", label: "削除" },
          { type: "separator" },
          { role: "selectAll", label: "すべてを選択" }
        ] as Electron.MenuItemConstructorOptions[])
      ]
    },
    {
      label: "表示",
      submenu: [
        {
          label: "再読み込み",
          accelerator: "CmdOrCtrl+R",
          click() {
            base.tabManager?.reloadTab();
          }
        },
        {
          label: "強制的に再読み込み",
          accelerator: "CmdOrCtrl+Shift+R",
          click() {
            base.tabManager?.reloadTab(undefined, true);
          }
        },
        (process.platform === "darwin" ? {
          label: "開発者ツールを表示",
          accelerator: "Cmd+Option+I", // macOSのみ
          click() {
            base.tabManager?.toggleDevTools();
          }
        } : {
          label: "開発者ツールを表示",
          accelerator: "F12", // WindowsとLinux
          click() {
            base.tabManager?.toggleDevTools();
          }
        }),
        { type: "separator" },
        { role: "resetZoom", label: "実際のサイズ" },
        { role: "zoomIn", label: "拡大" },
        { role: "zoomOut", label: "縮小" },
        { type: "separator" },
        { role: "togglefullscreen", label: "フルスクリーン" }
      ]
    },
    {
      label: "ウィンドウ",
      submenu: [
        { role: "minimize", label: "最小化" },
        { role: "zoom", label: "ズーム" },
        ...(process.platform === "darwin" ? [
          { type: "separator" },
          { role: "front", label: "ウィンドウを手前に表示" },
          { type: "separator" },
          { role: "window", label: "ウィンドウ" }
        ] as Electron.MenuItemConstructorOptions[] : [
          { role: "close", label: "閉じる" }
        ] as Electron.MenuItemConstructorOptions[])
      ]
    },
    {
      label: "ヘルプ",
      submenu: [
        {
          label: `${app.name} ヘルプ`,
          enabled: false
        },
        {
          label: `${app.name}の問題を報告`,
          click() {
            shell.openExternal(`https://github.com/Mf-3d/${app.name}/issues/new`)
          }
        },
        ...(process.platform === "darwin" ? [] as Electron.MenuItemConstructorOptions[] : [
          { type: "separator" },
          { role: "about", label: `${app.name}について` }
        ])
      ] as Electron.MenuItemConstructorOptions[]
    }
  ];



  const menu = Menu.buildFromTemplate(template);

  return menu;
}
/** @deprecated */
export function buildNavigationContextMenu(base: Base, state: {
  type: "normal" | "text" | "link" | "image" | "audio" | "video",
  isEditable: boolean,
  canGoBack: boolean,
  canGoForward: boolean,
  params: Electron.ContextMenuParams
}) {
  const templateContextMenu: Electron.MenuItemConstructorOptions[] = [
    ...((state.isEditable && process.platform !== "linux") ? ((process.platform === "win32") ? [
      {
        label: "絵文字",
        accelerator: "Super+.",
        click() {
          app.showEmojiPanel();
        }
      },
      {
        type: "separator"
      }
    ] : [
      {
        label: "絵文字",
        click() {
          app.showEmojiPanel();
        }
      },
      {
        type: "separator"
      }
    ]) as Electron.MenuItemConstructorOptions[] : []),

    // ---編集可能
    ...((state.isEditable) ? [
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
      },
    ] as Electron.MenuItemConstructorOptions[] : []),
    {
      label: "新しいタブ",
      accelerator: "Ctrl+T",
      click() {
        base.tabManager?.newTab(undefined, true);
      }
    },
    {
      label: "戻る",
      accelerator: "Alt+Left",
      enabled: state.canGoBack,
      click() {
        base.tabManager?.goBack();
      }
    },
    {
      label: "進む",
      accelerator: "Alt+Right",
      enabled: state.canGoForward,
      click() {
        base.tabManager?.goForward();
      }
    },
    {
      type: "separator"
    },
    {
      label: "ナビゲーションの開発者ツールを表示",
      click() {
        base.nav.webContents.toggleDevTools();
      }
    },
    {
      label: "設定",
      enabled: false,
      click() {
        // 設定ウィンドウ
      }
    },
  ];
  
  const menu = Menu.buildFromTemplate(templateContextMenu);

  return menu;
}
export function buildContextMenu(base: Base, state: {
  type: "normal" | "text" | "link" | "image" | "audio" | "video",
  isEditable: boolean,
  canGoBack: boolean,
  canGoForward: boolean,
  params: Electron.ContextMenuParams,
  isNav: boolean
}): Electron.Menu {
  const template: Electron.MenuItemConstructorOptions[] = [
    ...((state.isEditable && process.platform !== "linux") ? ((process.platform === "win32") ? [
      {
        label: "絵文字",
        accelerator: "Super+.",
        click() {
          app.showEmojiPanel();
        }
      },
      {
        type: "separator"
      }
    ] : [
      {
        label: "絵文字",
        click() {
          app.showEmojiPanel();
        }
      },
      {
        type: "separator"
      }
    ]) : []) as Electron.MenuItemConstructorOptions[],

    // ---編集可能
    ...((state.isEditable) ? [
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
      },
    ] : (state.type === "text" ? [
      {
        label: "コピー",
        role: "copy",
        enabled: state.params.selectionText !== ""
      },
      {
        label: `「${state.params.selectionText}」を検索`,
        click() {
          base.tabManager?.newTab(state.params.selectionText, true)
        }
      },
      {
        type: "separator"
      },
    ] : [])) as Electron.MenuItemConstructorOptions[],
    ...(state.type === "link" ? [
      {
        label: "新しいタブで開く",
        click() {
          base.tabManager?.newTab(state.params.linkURL)
        }
      },
      {
        type: "separator"
      },
    ] : []) as Electron.MenuItemConstructorOptions[],
    ...(state.isNav ? [
      {
        label: "新しいタブ",
        accelerator: "Ctrl+T",
        click() {
          base.tabManager?.newTab(undefined, true);
        }
      },
    ] : [
      {
        label: "戻る",
        accelerator: "Alt+Left",
        enabled: state.canGoBack,
        click() {
          base.tabManager?.goBack();
        }
      },
      {
        label: "進む",
        accelerator: "Alt+Right",
        enabled: state.canGoForward,
        click() {
          base.tabManager?.goForward();
        }
      },
      {
        label: "再読み込み",
        accelerator: "CmdOrCtrl+R",
        click() {
          base.tabManager?.reloadTab();
        }
      },
    ]),
    {
      type: "separator"
    },
    ...(state.isNav ? [
      {
        type: "separator"
      },
      {
        label: "ナビゲーションの開発者ツールを表示",
        click() {
          base.nav.webContents.toggleDevTools();
        }
      },
      {
        label: "設定",
        enabled: false,
        click() {
          // 設定ウィンドウ
        }
      }
    ] : [
      {
        label: "ページのソースを表示",
        accelerator: "Ctrl+U",
        click() {
          base.tabManager?.newTab(`view-source:${base.tabManager?.getActiveTabCurrent()?.entity.webContents.getURL()}`);
        }
      },
      (process.platform === "darwin" ? {
        label: "開発者ツールを表示",
        accelerator: "Cmd+Option+I", // macOSのみ
        click() {
          base.tabManager?.toggleDevTools();
        }
      } : {
        label: "開発者ツールを表示",
        accelerator: "F12", // WindowsとLinux
        click() {
          base.tabManager?.toggleDevTools();
        }
      })
    ]) as Electron.MenuItemConstructorOptions[]
  ];

  const menu = Menu.buildFromTemplate(template);

  return menu;
}