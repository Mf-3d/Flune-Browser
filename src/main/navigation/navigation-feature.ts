import path from "path";
import { app, BaseWindow, WebContentsView } from "electron";
import { resolveView } from "@/shared/resolveView";
import { IPC_NOTIFY, IpcEvents, IpcNotify } from "@/shared/ipc/channels";

type NavigationState = {
  url?: string;
  isBookmarked?: boolean;
};

export type Navigation = {
    view: WebContentsView;
    attach: () => void;
    updateState: (state: NavigationState) => void;
    updateTheme: (themeId: string) => void;
    setWidth: (width: number) => void;
    send: (channel: IpcNotify, ...args: any[]) => void;
};

export function createNavigationFeature(baseWindow: BaseWindow, viewY: number, themeId: string, onLoaded?: () => void): Navigation {
  let currentState: NavigationState = {};

  const view = new WebContentsView({
    webPreferences: {
      preload: path.join(__dirname, "..", "preload", "navigation.js"),
      additionalArguments: [
        `--is-packaged=${app.isPackaged}`
      ]
    }
  });

  view.setBounds({
    width: baseWindow.getContentBounds().width,
    height: viewY,
    x: 0,
    y: 0,
  });

  registerWebContentsEvents(view, themeId, onLoaded);

  view.webContents.loadURL(resolveView("navigation"));

  function attach() {
    baseWindow.contentView.addChildView(view);
  }

  function updateState(state: NavigationState) {
    currentState = state;
    view.webContents.send(IPC_NOTIFY.NAVIGATION_STATE, state);
  }

  function updateTheme(themeId: string) {
    view.webContents.send(IPC_NOTIFY.NAVIGATION_APPLY_THEME, themeId);
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
      height: viewY,
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
  themeId: string,
  onLoaded?: () => void
) {
  view.webContents.on("did-finish-load", () => {
    onLoaded?.();
    view.webContents.send(IPC_NOTIFY.NAVIGATION_APPLY_THEME, themeId);
  });
}