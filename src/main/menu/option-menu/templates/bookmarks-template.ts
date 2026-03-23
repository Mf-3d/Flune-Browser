import type { OptionMenuItem } from "@/shared/types/menu";
import type { MenuTemplateContext } from "./types";

export function buildBookmarksTemplate(context: MenuTemplateContext): OptionMenuItem[] {
  const max: number = 10;

  const bookmarkItems: OptionMenuItem[] = context.bookmarkNodes
    .slice(
      context.bookmarkNodes.length - max <= 0 ? 0 : context.bookmarkNodes.length - max
    )
    .map((node) => {
      switch (node.type) {
        case "bookmark":
          return {
            type: "item",
            enabled: false,
            action: {
              type: "open-bookmark",
              payload: {
                id: node.id,
              },
            },
            label: node.title,
          };
        case "folder":
          return {
            type: "item",
            enabled: false,
            action: {
              type: "open-bookmark",
              payload: {
                id: node.id,
                children: node.children,
              },
            },
            label: node.title,
          };
      }
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
