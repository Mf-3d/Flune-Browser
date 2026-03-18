export type ApplicationMenuActions = {
  newTab: () => void,
  reloadTab: () => void,
  reloadTabIgnoringCache: () => void,
  toggleDevTools: () => void,
  focusSearchBar: () => void,
  reportIssue: () => void,
}

export function createAppMenuTemplate(
  appName: string,
  actions: ApplicationMenuActions
): Electron.MenuItemConstructorOptions[] {
  return [
    ...(process.platform === "darwin" ? [{
      label: appName,
      submenu: [
        { role: "about", label: `${appName}について` },
        { type: "separator" },
        { role: "services", label: "サービス" },
        { type: "separator" },
        { role: "hide", label: `${appName}を隠す` },
        { role: "hideothers", label: "ほかを隠す" },
        { role: "unhide", label: "すべて表示" },
        { type: "separator" },
        { role: "quit", label: `${appName}を終了` }
      ]
    }] as Electron.MenuItemConstructorOptions[] : [] as Electron.MenuItemConstructorOptions[]),
    {
      label: "ファイル",
      submenu: [
        {
          label: "新しいタブ",
          accelerator: "CmdOrCtrl+T",
          click: actions.newTab,
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
          click: actions.reloadTab,
        },
        {
          label: "強制的に再読み込み",
          accelerator: "CmdOrCtrl+Shift+R",
          click: actions.reloadTabIgnoringCache,
        },
        {
          label: "開発者ツールを表示",
          accelerator:
            (process.platform === "darwin") ?
              "Cmd+Option+I" :
              "F12",
          click: actions.toggleDevTools
        },
        { type: "separator" },
        { role: "resetZoom", label: "実際のサイズ" },
        { role: "zoomIn", label: "拡大" },
        { role: "zoomOut", label: "縮小" },
        { type: "separator" },
        { role: "togglefullscreen", label: "フルスクリーン" },
        { type: "separator" },
        {
          label: "検索バーをフォーカス",
          accelerator: "CmdOrCtrl+L",
          visible: false,
          click: actions.focusSearchBar,
        }
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
          label: `${appName} ヘルプ`,
          enabled: false
        },
        {
          label: `${appName}の問題を報告`,
          click: actions.reportIssue,
        },
        ...(process.platform === "darwin" ? [] as Electron.MenuItemConstructorOptions[] : [
          { type: "separator" },
          { role: "about", label: `${appName}について` }
        ])
      ] as Electron.MenuItemConstructorOptions[]
    }
  ];
}