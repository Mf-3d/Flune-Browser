import path from "path";
import { app, BaseWindow, WebContentsView } from "electron";
import { resolveView, ROUTE_MAP } from "@/shared/resolveView";
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
  send: (channel: IpcEvents, ...args: any[]) => void;
};

export function createNavigationFeature(baseWindow: BaseWindow, viewY: number, themeUrl: string, onLoaded?: () => void): Navigation {
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
    height: viewY,
    x: 0,
    y: 0,
  });

  registerWebContentsEvents(view, themeUrl, onLoaded);

  view.webContents.loadURL(resolveView(ROUTE_MAP.navigation));

  function attach() {
    baseWindow.contentView.addChildView(view);
  }

  function updateState(state: NavigationState) {
    currentState = state;
    view.webContents.send(IPC_NOTIFY.NAVIGATION_STATE, state);
  }

  function updateTheme(themeUrl: string) {
    view.webContents.send(IPC_NOTIFY.NAVIGATION_APPLY_THEME, themeUrl);
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
  themeUrl: string,
  onLoaded?: () => void
) {
  view.webContents.on("did-finish-load", () => {
    onLoaded?.();
    view.webContents.send(IPC_NOTIFY.NAVIGATION_APPLY_THEME, themeUrl);
  });
}