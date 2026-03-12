import { IPC_NOTIFY } from "@/shared/ipc/channels";
import { ERR_CODES, ERR_PAGES } from "./types";
import { Window } from "@/main/window/window";
import { NavigationState } from "@/shared/types/preload-api";
import { dialog } from "electron";
import { Tab } from "./tab";
import { Settings } from "@/main/settings";
import Event from "@/main/lib/event";
import { TabCollection } from "./tab-collection";

export function registerTabEvents(
  tab: Tab,
  collection: TabCollection,
  window: Window,
  settings: Settings,
  event: Event,
) {
  const webContents = tab.webContents;

  window.win.on("resize", () => {
    const winBounds = window.win.getContentBounds();
    const tabBounds = tab.getBounds();

    tab.setBounds({
      x: tabBounds.x,
      y: tabBounds.y,
      width: winBounds.width,
      height: winBounds.height,
    });
  });

  webContents.on("page-title-updated", (_, title) => {
    tab.title = title;

    window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
      id: tab.id,
      title,
    });
  });

  webContents.on("page-favicon-updated", (_, favicons) => {
    console.debug(favicons);

    const favicon = favicons[0];
    tab.favicon = favicon;

    window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
      id: tab.id,
      favicon
    });
  });

  webContents.on("did-navigate", (_, url) => {
    console.debug("did-navigate");
    tab.url = new URL(url);

    // 履歴追加、ブックマークされているかの状態
  });

  webContents.on("did-navigate-in-page", (_, url) => {
    console.debug("did-navigate-in-page");
    tab.url = new URL(url);

    // 履歴追加、ブックマークされているかの状態
  });

  webContents.on("did-start-loading", () => {
    tab.isLoading = true;

    window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
      id: tab.id,
      isLoading: true
    });
  });

  webContents.on("did-stop-loading", () => onDidStopLoading(tab, collection, window, settings, event));

  webContents.on("did-fail-load", (_, errCode) => {
    // 無限ループが発生するのを防ぐ
    if (tab.url && tab.url.toString().startsWith(ERR_PAGES.directory)) return;

    switch (errCode) {
      case (ERR_CODES["server-notfound"]): {
        tab.loadURL(ERR_PAGES["server-notfound"]);
        break;
      }
      default: {
        tab.loadURL(ERR_PAGES.generic);
        console.warn("Undefined error code:", errCode);
        break;
      }
    }
  });

  webContents.on("audio-state-changed", (event) => {
    tab.isAudible = event.audible;

    window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
      id: tab.id,
      isAudible: tab.isAudible,
    });
  });

  webContents.on("will-prevent-unload", (event) => onBeforeUnload(event, window.win));
}

function updateTheme(webContents: Electron.WebContents, settings: Settings) {
  webContents.send(
    IPC_NOTIFY.TAB_THEME,
    settings.themeService.getThemeById(settings.themeService.getCurrentThemeId())
  );
}

function onBeforeUnload(
  event: {
    preventDefault: () => void;
    readonly defaultPrevented: boolean;
  },
  baseWindow: Electron.BaseWindow
) {
  const choice = dialog.showMessageBoxSync(baseWindow, {
    type: "question",
    buttons: ["このページを離れる", "キャンセル"],
    title: "このページを離れますか？",
    message: '変更内容が保存されない可能性があります。',
    defaultId: 0,
    cancelId: 1
  });

  const leave = (choice === 0);
  if (leave) {
    event.preventDefault();
  }
}

function onDidStopLoading(tab: Tab, collection: TabCollection, window: Window, settings: Settings, event: Event) {
  tab.isLoading = false;
  tab.canGoBack = tab.webContents.navigationHistory.canGoBack();
  tab.canGoForward = tab.webContents.navigationHistory.canGoForward();

  updateTheme(tab.webContents, settings);
  event.on("theme-updated", () => updateTheme(tab.webContents, settings));

  if (collection.isActive(tab.id)) {
    const state: NavigationState = {
      canGoBack: tab.canGoBack,
      canGoForward: tab.canGoForward,
      input: tab.url?.toString(),
    };

    window.navigation.send(IPC_NOTIFY.NAVIGATION_UPDATE, state);
  }
}