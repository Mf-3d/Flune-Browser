import { app, dialog } from "electron";
import { resolveView, ROUTE_MAP } from "@/shared/resolveView";
import { config } from "@/app.config";

import type { Window } from "@/main/window/window";
import type { QuitContext, RelaunchOptions } from "./types";
import type { Versions } from "@/shared/types/preload-api";
import type { Tab } from "@/main/tab/tab";
import type { BookmarkService } from "@/main/bookmark/service";

export class ApplicationService {
  constructor(private readonly bookmarkService: BookmarkService) {}

  get name(): string {
    return config.productName;
  }

  get isPackaged() {
    return app.isPackaged;
  }

  disableHardwareAcceleration() {
    if (!app.isReady()) app.disableHardwareAcceleration();
  }

  relaunch(
    /**
     * @default 
     * ```ts
     * { forced: true }
     * ```
     */
    options?: RelaunchOptions
  ) {
    if (options && !options.forced) {
      options?.reason
      const choice = dialog.showMessageBoxSync({
        type: "question",
        message: "本当に再起動しますか？",
        detail: `${options?.reason + "\n"}再起動するとすべてのタブを閉じます。`,
        buttons: ["再起動する", "キャンセル"],
        defaultId: 0,
        cancelId: 1,
      });

      if (choice === 0) {
        app.relaunch();
        app.exit(0);
      }
    }
    else {
      app.relaunch();
      app.exit(0);
    }
  }

  quit(options: QuitContext) {
    if (options.forced) app.quit();
    else {
      if (!options.window) {
        throw new Error("Window does not exist.");
      }

      const choice = dialog.showMessageBoxSync(options.window.getNativeWindow(), {
        type: "question",
        message: "本当に終了しますか？",
        detail: `${options.window.tabManager.length}個のタブを閉じます。`,
        buttons: ["終了する", "キャンセル"],
        defaultId: 0,
        cancelId: 1,
      });

      if (choice === 0) app.quit();
    }
  }

  getVersion(): string {
    return app.getVersion();
  }

  getVersions(): Versions {
    return {
      flune: this.getVersion(),
      electron: process.versions.electron,
      node: process.versions.node,
      chrome: process.versions.chrome,
      v8: process.versions.v8,
    };
  }

  createTab(window: Window, input?: string): Tab {
    return window.tabManager.createTab({
      input,
    });
  }

  showSettingsPage(window: Window) {
    window.tabManager.navigate(resolveView(ROUTE_MAP.settings));
  }

  showVersionsPage(window: Window) {
    window.tabManager.navigate(resolveView(ROUTE_MAP.version));
  }

  addActiveTabToBookmarks(window: Window) {
    const tab = window.tabManager.getActiveTab();

    if (!tab) {
      throw new Error("Tab does not exist.");
    }

    if (!tab.url) {
      throw new Error(`Tab (${tab.id}) does not have URL.`);
    }

    this.bookmarkService.add({
      title: tab.title,
      url: tab.url.toString(),
    });
  }
}
