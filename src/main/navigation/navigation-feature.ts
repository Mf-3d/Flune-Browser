/**
 * "navigation-feature.ts"
 * 
 * ナビゲーション
 */

import path from "path";
import { app, BaseWindow, WebContentsView } from "electron";
import { resolveView, ROUTE_MAP } from "@/shared/resolveView";
import { IPC_NOTIFY } from "@/shared/ipc/channels";
import { NavigationInit, NavigationState } from "@/shared/types/preload-api";

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
  baseWindow: BaseWindow,
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
        `--is-packaged=${app.isPackaged}`
      ]
    }
  });

  view.setBounds({
    width: baseWindow.getContentBounds().width,
    height: settings.viewY,
    x: 0,
    y: 0,
  });

  registerWebContentsEvents(view, settings, onLoaded);

  view.webContents.loadURL(resolveView(ROUTE_MAP.navigation));

  function attach() {
    baseWindow.contentView.addChildView(view);
  }

  function updateState(state: NavigationState) {
    currentState = state;
    view.webContents.send(IPC_NOTIFY.NAVIGATION_UPDATE, state);
  }

  function updateTheme(themeUrl: string) {
    view.webContents.send(IPC_NOTIFY.NAVIGATION_THEME, themeUrl);
  }

  function send(
    // channel: IpcNotify,
    channel: string,
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
  // ナビゲーションが読み込まれたらコールバックを返してIPCを送信する。
  view.webContents.on("did-finish-load", () => {
    onLoaded?.();
    view.webContents.send(IPC_NOTIFY.NAVIGATION_INIT, {
      isMac: process.platform === "darwin",
      showHomeButton: settings.showHomeButton
    } as NavigationInit);
    view.webContents.send(IPC_NOTIFY.NAVIGATION_THEME, settings.themeUrl);
  });
}