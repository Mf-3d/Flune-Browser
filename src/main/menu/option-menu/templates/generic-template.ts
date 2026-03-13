import { OptionMenuItem } from "./types";

export const genericTemplate: OptionMenuItem[] = [
  {
    type: "item",
    id: "new-tab",
    label: "新しいタブ",
    accelerator: "Ctrl+T"
  },
  {
    type: "separator"
  },
  {
    type: "submenu",
    id: "bookmarks",
    label: "ブックマーク",
  },
  {
    type: "submenu",
    id: "histories",
    label: "履歴",
  },
  {
    type: "item",
    id: "open-downloads",
    label: "ダウンロード",
    accelerator: "Ctrl+J"
  },
  {
    type: "separator"
  },
  {
    type: "item",
    id: "open-versions",
    label: "バージョン情報",
  },
  {
    type: "item",
    id: "open-settings",
    label: "設定",
  },
  {
    type: "item",
    id: "quit",
    label: "終了",
  },
];