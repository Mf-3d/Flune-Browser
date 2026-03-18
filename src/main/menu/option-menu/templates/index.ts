import { buildBookmarksTemplate } from "./bookmarks-template";

import type { OptionMenuItem } from "@/shared/types/menu";
import type { MenuTemplateContext } from "./types";

export function buildOptionMenuTemplate(context: MenuTemplateContext): OptionMenuItem[] {
  return [
    {
      type: "item",
      action: { type: "new-tab" },
      label: "新しいタブ",
      accelerator: "Ctrl+T"
    },
    {
      type: "separator"
    },
    {
      type: "submenu",
      label: "ブックマーク",
      children: buildBookmarksTemplate(context),
    },
    {
      type: "submenu",
      label: "履歴",
      children: []
    },
    {
      type: "item",
      action: { type: "open-downloads-page" },
      label: "ダウンロード",
      accelerator: "Ctrl+J"
    },
    {
      type: "separator"
    },
    {
      type: "item",
      action: { type: "open-versions-page" },
      label: "バージョン情報",
    },
    {
      type: "item",
      action: { type: "open-settings-page" },
      label: "設定",
    },
    {
      type: "item",
      action: { type: "quit" },
      label: "終了",
    },
  ];
}