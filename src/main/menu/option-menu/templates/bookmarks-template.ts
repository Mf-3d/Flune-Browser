import type { OptionMenuItem } from "@/shared/types/menu";
import type { MenuTemplateContext } from "./types";

export function buildBookmarksTemplate(context: MenuTemplateContext): OptionMenuItem[] {
  const bookmarkMenuItem: OptionMenuItem[] = context.bookmarks.map((bookmark) => {
    return {
      type: "item",
      action: {
        type: "open-bookmark",
        payload: {
          id: bookmark.id
        }
      },
      label: bookmark.title,
    };
  });

  return [
    {
      type: "item",
      action: {
        type: "add-bookmark",
        payload: undefined
      },
      label: "新しいブックマークを追加",
      accelerator: "Ctrl+D"
    },
    {
      type: "separator"
    },
    {
      type: "item",
      action: {
        type: "open-bookmarks-page",
        payload: undefined
      },
      label: "ブックマークをすべて表示",
      accelerator: "Ctrl+Shift+O"
    },
    {
      type: "separator"
    },
    ...bookmarkMenuItem
  ];
}