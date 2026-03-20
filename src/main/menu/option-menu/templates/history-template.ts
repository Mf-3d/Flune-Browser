import { OptionMenuItem } from "@/shared/types/menu";

export function buildHistoryTemplate(): OptionMenuItem[] {
  return [
    {
      type: "go-back",
      label: "戻る"
    },
  ];
}