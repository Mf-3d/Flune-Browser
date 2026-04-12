import type { ApplicationService } from "@/main/application/application-service";
import type { BookmarkService } from "@/main/bookmark/service";
import type { Window } from "@/main/window/window";
import type { OptionMenuController } from "../controllers/option-menu-controller";
import type { HistoryService } from "@/main/history/service";
import type { GroupedHistory } from "@/shared/types/history";
import type { BookmarkNodeWithChildren } from "@/shared/types/bookmark";

export type MenuActionContext = {
  appService: ApplicationService;
  bookmarkService: BookmarkService;
  historyService: HistoryService;
  window: Window;
  optionMenuManager: OptionMenuController;
};

export type MenuTemplateContext = {
  bookmarkNodes: BookmarkNodeWithChildren[];
  groupedHistory: GroupedHistory[];
};

export type MenuAction = (context: MenuActionContext) => void;
