/**
 * "navigation-feature.ts"
 *
 * ナビゲーション
 */

import path from "node:path";
import { dialog, WebContentsView } from "electron";
import { resolveView, ROUTE_MAP } from "@/shared/resolveView";
import { IPC_NOTIFY, type IpcNotify } from "@/shared/ipc/channels";
import { ContextMenuController } from "@/main/menu/context-menu/controllers/context-menu-controller";

import type { NavigationContext, NavigationState } from "@/shared/types/preload-api";
import type { ApplicationService } from "@/main/application/application-service";
import type { Window } from "@/main/window/window";
import type { Logger } from "@/main/utils/logger";

export type Navigation = ReturnType<typeof createNavigationFeature>;

/**
 * ナビゲーションの機能を作成して返す。
 * - ビューを作成
 * - アタッチする関数
 * - 状態とテーマを更新する関数
 *
 * @param baseWindow ベースとなるウィンドウ
 * @param settings ナビゲーションを作成するときに必要なパラメータ
 * @param onLoaded ロードされたときにコールバック関数を実行する
 * @returns
 */
export function createNavigationFeature(
  appService: ApplicationService,
  window: Window,
  settings: {
    viewY: number;
    themeUrl: string;
    showHomeButton: boolean;
  },
  logger: Logger,
  onLoaded?: () => void
) {
  const view = new WebContentsView({
    webPreferences: {
      preload: path.join(__dirname, "..", "preload", "index.js"),
      additionalArguments: [`--is-packaged=${appService.isPackaged}`],
    },
  });

  const contextMenuController = new ContextMenuController(window);
  contextMenuController.register(view.webContents, {
    area: "navigation",
  });

  view.setBounds({
    width: window.getContentBounds().width,
    height: settings.viewY,
    x: 0,
    y: 0,
  });

  view.webContents.session.setCertificateVerifyProc((_, callback) => {
    callback(-3);
  });

  registerWebContentsEvents(view, settings, logger, onLoaded);

  view.webContents.loadURL(resolveView(ROUTE_MAP.navigation));

  function shouldClearNavigation(url: string): boolean {
    return url === resolveView(ROUTE_MAP.home);
  }

  function attach() {
    window.appendView(view);
  }

  function updateState(state: NavigationState) {
    if (state.input && shouldClearNavigation(state.input)) state.input = "";
    view.webContents.send(IPC_NOTIFY.NAVIGATION_UPDATE, state);
  }

  function updateTheme(themeUrl: string) {
    view.webContents.send(IPC_NOTIFY.NAVIGATION_THEME, themeUrl);
  }

  function send(
    channel: IpcNotify,
    // channel: IpcNotify & IpcEvents,
    ...args: unknown[]
  ) {
    view.webContents.send(channel, ...args);
  }

  function setWidth(width: number) {
    view.setBounds({
      width,
      height: settings.viewY,
      x: 0,
      y: 0,
    });
  }

  function close() {
    view.webContents.close();
  }

  return {
    view,
    attach,
    updateState,
    updateTheme,
    setWidth,
    send,
    close,
  };
}

function registerWebContentsEvents(
  view: WebContentsView,
  settings: {
    themeUrl: string;
    showHomeButton: boolean;
  },
  logger: Logger,
  onLoaded?: () => void
) {
  const context: NavigationContext = {
    isMac: process.platform === "darwin",
    showHomeButton: settings.showHomeButton,
  };

  // ナビゲーションが読み込まれたらコールバックを返してIPCを送信する。
  view.webContents.once("did-finish-load", () => {
    onLoaded?.();
    view.webContents.send(IPC_NOTIFY.NAVIGATION_INIT, context);
    view.webContents.send(IPC_NOTIFY.NAVIGATION_THEME, settings.themeUrl);

    setTimeout(async () => {
      const isBlank = await view.webContents.executeJavaScript(`
        document.body && document.body.innerText.trim().length === 0
      `);

      if (isBlank) {
        logger.warn("The navigation may not have loaded correctly.");

        dialog.showMessageBoxSync({
          type: "warning",
          title: "The app cannot be launched properly.",
          message: "The navigation may not have loaded correctly.",
          detail: "Please close and restart the app.",
        });
      }
    }, 2000);
  });

  view.webContents.on("did-fail-load", (_, errCode, desc) => {
    logger.error(new Error(`Navigation did fail load; CODE: ${errCode} DESC: ${desc}`));

    dialog.showMessageBoxSync({
      type: "error",
      title: "The app cannot be launched properly.",
      message: "Navigation did fail load!",
      detail: "Please close and restart the app.",
    });
  });

  view.webContents.session.webRequest.onErrorOccurred((details) => {
    logger.error(
      new Error(
        `An error occurred in WebRequest: "${details.error}"; URL: "${details.url}".`,
        {
          cause: details.error,
        }
      )
    );
  });
}
