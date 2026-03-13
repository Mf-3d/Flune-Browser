import { IPC_NOTIFY } from "@/shared/ipc/channels";
import { ERR_CODES, ERR_PAGES } from "./types";
import { dialog, WebContents } from "electron";

import type { Settings } from "@/main/settings";
import type Event from "@/main/lib/event";
import type { Window } from "@/main/window/window";
import type { Tab } from "./tab";

/**
 * @param tab 
 * @param isActiveTab 
 * @param window 
 * @param settings 
 * @param event 
 * @returns Cleanup function.
 */
export function registerTabEvents(
  tab: Tab,
  isActiveTab: (id: string) => boolean,
  window: Window,
  settings: Settings,
  event: Event,
): () => void {
  const webContents = tab.webContents;

  function onResize() {
    const winBounds = window.win.getContentBounds();
    const tabBounds = tab.getBounds();

    tab.setBounds({
      x: tabBounds.x,
      y: tabBounds.y,
      width: winBounds.width,
      height: winBounds.height,
    });
  }

  function onTitleUpdated(
    _: Electron.Event,
    title: string
  ) {
    tab.title = title;

    window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
      id: tab.id,
      title,
    });
  }

  function onFaviconUpdated(
    _: Electron.Event,
    favicons: string[]
  ) {
    const favicon = favicons[0];
    tab.favicon = favicon;

    window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
      id: tab.id,
      favicon
    });
  }

  function onDidNavigate(
    _: Electron.Event,
    url: string
  ) {
    tab.url = new URL(url);

    // 履歴追加、ブックマークされているかの状態
  }

  function onDidStartLoading() {
    tab.isLoading = true;

    window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
      id: tab.id,
      isLoading: true
    });
  }

  function onDidStopLoading() {
    tab.isLoading = false;
    tab.canGoBack = tab.webContents.navigationHistory.canGoBack();
    tab.canGoForward = tab.webContents.navigationHistory.canGoForward();

    updateTheme(tab.webContents, settings);
    event.on("theme-updated", () => updateTheme(tab.webContents, settings));

    window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
      id: tab.id,
      isLoading: false
    });

    if (isActiveTab(tab.id)) {
      window.navigation.updateState({
        canGoBack: tab.canGoBack,
        canGoForward: tab.canGoForward,
        input: tab.url?.toString(),
      });
    }
  }

  function onDidFailLoad(
    _: Electron.Event,
    errCode: number
  ) {
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
  }

  function onAudioStateChanged(
    event: Electron.Event<Electron.WebContentsAudioStateChangedEventParams>
  ) {
    tab.isAudible = event.audible;

    window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
      id: tab.id,
      isAudible: tab.isAudible,
    });
  }

  function onBeforeUnload(
    event: {
      preventDefault: () => void;
      readonly defaultPrevented: boolean;
    }
  ) {
    const choice = dialog.showMessageBoxSync(window.win, {
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

  window.win.on("resize", onResize);

  webContents.on("page-title-updated", onTitleUpdated);
  webContents.on("page-favicon-updated", onFaviconUpdated);
  webContents.on("did-navigate", onDidNavigate);
  webContents.on("did-navigate-in-page", onDidNavigate);
  webContents.on("did-start-loading", onDidStartLoading);
  webContents.on("did-stop-loading", onDidStopLoading);
  webContents.on("did-fail-load", onDidFailLoad);
  webContents.on("audio-state-changed", onAudioStateChanged);
  webContents.on("will-prevent-unload", onBeforeUnload);

  return () => {
    window.win.off("resize", onResize);

    webContents.off("page-title-updated", onTitleUpdated);
    webContents.off("page-favicon-updated", onFaviconUpdated);
    webContents.off("did-navigate", onDidNavigate);
    webContents.off("did-navigate-in-page", onDidNavigate);
    webContents.off("did-start-loading", onDidStartLoading);
    webContents.off("did-stop-loading", onDidStopLoading);
    webContents.off("did-fail-load", onDidFailLoad);
    webContents.off("audio-state-changed", onAudioStateChanged);
    webContents.off("will-prevent-unload", onBeforeUnload);
  };
}

function updateTheme(webContents: WebContents, settings: Settings) {
  webContents.send(
    IPC_NOTIFY.TAB_THEME,
    settings.themeService.getThemeById(settings.themeService.getCurrentThemeId())
  );
}