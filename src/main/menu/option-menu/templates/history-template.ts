import type { OptionMenuItem } from "@/shared/types/menu";
import type { MenuTemplateContext } from "./types";

export function buildHistoryTemplate(context: MenuTemplateContext): OptionMenuItem[] {
  const historyItems = context.history
    .slice(
      context.history.length - 10 <= 0
        ? 0
        : context.history.length - 10
    )
    .map((item) => {
      return {
        type: "item",
        enabled: false,
        action: {
          type: "open-history",
          payload: {
            id: item.id,
          },
        },
        label: item.title,
      };
    })
    .reverse() as OptionMenuItem[];

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
