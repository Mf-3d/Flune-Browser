import { handle } from "@/main/ipc/handler";
import { IPC_INVOKE } from "@/shared/ipc/channels";

import type { WindowManager } from "@/main/window/window-manager";
import type { DataManager } from "@/main/lib/data";

export function registerBookmarkHandler(windowManager: WindowManager, data: DataManager) {
  try {
    handle(IPC_INVOKE.BOOKMARK_TOGGLE, (event) => {
      const window = windowManager.getWindowFromWebContents(event.sender);

      if (!window) {
        throw new Error("Window does not exist.");
      }

      const tabCurrent = window.tabManager.getActiveTab();
      const tabTitle = tabCurrent?.webContents.getTitle();
      const tabURL = tabCurrent?.webContents.getURL();

      if (!tabTitle || !tabURL) throw new Error;

      if (!data.bookmarks.existByUrl(tabURL)) {
        data.bookmarks.add({
          title: tabTitle,
          url: tabURL,
          tag: [], // 実装予定
          parentId: "root", // 実装予定、デフォルトはルート
        });
      } else {
        const bookmark = data.bookmarks.getByUrl(tabURL);

        if (!bookmark) throw new Error;

        data.bookmarks.remove(bookmark.id);
      }
    });
  } catch (err) {
    console.error("Failed to register bookmarkHandler:", err); // ロガーはまだ入れていないので仮
  }
}