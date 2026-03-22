import type { OptionMenuItem } from "@/shared/types/menu";
import type { MenuTemplateContext } from "./types";

export function buildBookmarksTemplate(context: MenuTemplateContext): OptionMenuItem[] {
  const bookmarkItems: OptionMenuItem[] = context.bookmarks
    .slice(context.history.length - 10)
    .map((bookmark) => {
      return {
        type: "item",
        enabled: false,
        action: {
          type: "open-bookmark",
          payload: {
            id: bookmark.id,
          },
        },
        label: bookmark.title,
      };
    });

  return [
    {
      type: "go-back",
      label: "戻る",
    },
    {
      type: "separator",
    },
    {
      type: "item",
      action: {
        type: "add-bookmark",
        payload: undefined,
      },
      label: "新しいブックマークを追加",
      accelerator: "Ctrl+D",
    },
    {
      type: "separator",
    },
    {
      type: "item",
      action: {
        type: "open-bookmarks-page",
        payload: undefined,
      },
      enabled: false,
      label: "ブックマークをすべて表示",
      accelerator: "Ctrl+Shift+O",
    },
    {
      type: "separator",
    },
    ...bookmarkItems,
  ];
}
