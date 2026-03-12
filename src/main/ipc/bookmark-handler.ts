import { ipcMain } from "electron";

import { validateSender } from "@/main/ipc/validateSender";
import { TabManager } from "@/main/tab/tab-manager";
import { DataManager } from "@/main/lib/data";
import { IPC_INVOKE } from "@/shared/ipc/channels";

export function registerBookmarkHandler(tabManager: TabManager, data: DataManager) {
  try {
    ipcMain.handle(IPC_INVOKE.BOOKMARK_TOGGLE, (event) => {
      if (!event.senderFrame) throw new Error;
      if (!validateSender(event.senderFrame)) throw new Error;

      const tabCurrent = tabManager.getActiveTab();
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