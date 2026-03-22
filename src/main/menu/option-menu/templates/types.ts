import type { ApplicationService } from "@/main/application/application-service";
import type { BookmarkService } from "@/main/bookmark/service";
import type { Window } from "@/main/window/window";
import type { Bookmark, HistoryItem } from "@/shared/types/data";
import type { OptionMenuController } from "../controllers/option-menu-controller";

export type MenuActionContext = {
  appService: ApplicationService;
  bookmarkService: BookmarkService;
  window: Window;
  optionMenuManager: OptionMenuController;
};

export type MenuTemplateContext = {
  bookmarks: Bookmark[];
  history: HistoryItem[];
};

export type MenuAction = (context: MenuActionContext) => void;
