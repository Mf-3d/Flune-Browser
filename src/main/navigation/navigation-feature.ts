/**
 * "navigation-feature.ts"
 * 
 * ナビゲーション
 */

import path from "path";
import { WebContentsView } from "electron";
import { resolveView, ROUTE_MAP } from "@/shared/resolveView";
import { IPC_NOTIFY, type IpcNotify } from "@/shared/ipc/channels";
import { ContextMenuController } from "@/main/menu/context-menu/controllers/context-menu-controller";

import type { NavigationInit, NavigationState } from "@/shared/types/preload-api";
import type { ApplicationService } from "@/main/application/application-service";
import type { Window } from "@/main/window/window";

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
  onLoaded?: () => void
) {
  let currentState: NavigationState = {};

  const view = new WebContentsView({
    webPreferences: {
      preload: path.join(__dirname, "..", "preload", "index.js"),
      additionalArguments: [
        `--is-packaged=${appService.isPackaged}`
      ]
    }
  });

  const contextMenuController = new ContextMenuController(window);
  contextMenuController.register(view.webContents, {
    area: "navigation"
  });

  view.setBounds({
    width: window.getContentBounds().width,
    height: settings.viewY,
    x: 0,
    y: 0,
  });

  registerWebContentsEvents(view, settings, onLoaded);

  view.webContents.loadURL(resolveView(ROUTE_MAP.navigation));

  function attach() {
    window.win.contentView.addChildView(view);
  }

  function updateState(state: NavigationState) {
    currentState = state;
    view.webContents.send(IPC_NOTIFY.NAVIGATION_UPDATE, state);
  }

  function updateTheme(themeUrl: string) {
    view.webContents.send(IPC_NOTIFY.NAVIGATION_THEME, themeUrl);
  }

  function send(
    channel: IpcNotify,
    // channel: IpcNotify & IpcEvents,
    ...args: any[]
  ) {
    view.webContents.send(channel, ...args)
  }

  function setWidth(width: number) {
    view.setBounds({
      width,
      height: settings.viewY,
      x: 0,
      y: 0,
    });
  }

  return {
    view,
    attach,
    updateState,
    updateTheme,
    setWidth,
    send,
  }
}

function registerWebContentsEvents(
  view: WebContentsView,
  settings: {
    themeUrl: string,
    showHomeButton: boolean,
  },
  onLoaded?: () => void
) {
  const initOptions: NavigationInit = {
    showHomeButton: settings.showHomeButton,
  };

  // ナビゲーションが読み込まれたらコールバックを返してIPCを送信する。
  view.webContents.on("did-finish-load", () => {
    onLoaded?.();
    view.webContents.send(IPC_NOTIFY.NAVIGATION_INIT, initOptions);
    view.webContents.send(IPC_NOTIFY.NAVIGATION_THEME, settings.themeUrl);
  });
}