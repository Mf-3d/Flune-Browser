import type { Bookmark } from "@/shared/types/bookmark";

export type EventMap = {
  /**
   * Fire when the application initialization begins.
   */
  init: void;
  /**
   * Fire when the navigation bar has finished loading.
   */
  "navigation:init": void;
  /**
   * Fire when a new tab is created.
   */
  "tab:created": {
    /**
     * ID of the tab created.
     */
    tabId: string;
  };
  /**
   * Fire when a new tab is created.
   */
  "bookmark:created": {
    /**
     * ID of the tab created.
     */
    bookmark: Bookmark;
  };
  /**
   * Fire when settings is updated.
   */
  "settings:updated": void;
  /**
   * Fire when theme is updated.
   */
  "theme:updated": { themeId: string };
};
