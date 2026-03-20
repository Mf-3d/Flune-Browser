export function createEditableSelectionMenuTemplate(selectionText: string): Electron.MenuItemConstructorOptions[] {
  return [
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
      enabled: selectionText !== ""
    },
    {
      label: "切り取り",
      role: "cut",
      enabled: selectionText !== ""
    },
    {
      label: "コピー",
      role: "copy",
      enabled: selectionText !== ""
    },
    {
      label: "貼り付け",
      role: "paste"
    },
    {
      label: "削除",
      role: "delete",
      enabled: selectionText !== ""
    },
  ];
}