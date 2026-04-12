import { buildBookmarksTemplate } from "./bookmarks-template";
import { buildRootTemplate } from "./root-template";

import type { MenuPageId, OptionMenuItem } from "@/shared/types/menu";
import type { MenuTemplateContext } from "./types";
import { buildHistoryTemplate } from "./history-template";

export function buildOptionMenuPage(
  pageId: MenuPageId,
  context: MenuTemplateContext
): OptionMenuItem[] {
  switch (pageId) {
    case "root":
      return buildRootTemplate();

    case "bookmarks":
      return buildBookmarksTemplate(context);

    case "history":
      return buildHistoryTemplate(context);
  }
}
