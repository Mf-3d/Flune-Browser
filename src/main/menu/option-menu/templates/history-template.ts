import type { OptionMenuItem } from "@/shared/types/menu";
import type { MenuTemplateContext } from "./types";

export function buildHistoryTemplate(context: MenuTemplateContext): OptionMenuItem[] {
  let historyItems: OptionMenuItem[] = [];

  context.groupedHistory.reverse();

  for (const item of context.groupedHistory) {
    historyItems.push({
      type: "header",
      label: new Date(item.date).toLocaleDateString(),
    });

    historyItems.push(
      ...(item.items.map((item) => ({
        type: "item",
        action: {
          type: "open-history",
          payload: {
            id: item.id,
          },
        },
        label: item.title,
      })) as OptionMenuItem[])
    );
  }

  // historyItems = historyItems.reverse();

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
        type: "open-history-page",
        payload: undefined,
      },
      enabled: false,
      label: "履歴をすべて表示",
      accelerator: "Ctrl+H",
    },
    {
      type: "separator",
    },
    ...historyItems,
  ];
}
