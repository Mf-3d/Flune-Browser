import type { ApplicationService } from "@/main/application/application-service";
import type { Window } from "@/main/window/window";
import { Bookmark } from "@/shared/types/data";


export type MenuActionContext = {
  appService: ApplicationService;
  window: Window;
};

export type MenuTemplateContext = {
  bookmarks: Bookmark[];
};

export type MenuAction = (context: MenuActionContext) => void;