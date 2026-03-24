import { IPC_NOTIFY } from "@/shared/ipc/channels";
import { ERR_CODES, ERR_PAGES } from "./types";
import { dialog, WebContents } from "electron";

import type { Settings } from "@/main/settings";
import type { TabEventOptions } from "./types";

/**
 * @param tab
 * @param isActiveTab
 * @param window
 * @param settings
 * @param event
 * @returns Cleanup function.
 */
export function registerTabEvents(options: TabEventOptions): () => void {
  const webContents = options.tab.webContents;

  function onInit() {
    if (options.isActiveTab(options.tab.id)) {
      options.window.navigation.updateState({
        canGoBack: options.tab.canGoBack,
        canGoForward: options.tab.canGoForward,
        input: options.tab.url?.toString(),
        isBookmarked: options.bookmarkService.isBookmarked(options.tab.url!.toString()),
      });
    }
  }

  function onResize() {
    const winBounds = options.window.getContentBounds();
    const tabBounds = options.tab.getBounds();

    options.tab.setBounds({
      x: tabBounds.x,
      y: tabBounds.y,
      width: winBounds.width,
      height: winBounds.height - options.window.viewY,
    });
  }

  function onThemeChanged() {
    updateTheme(options.tab.webContents, options.settings);
  }

  function onTitleUpdated(_: Electron.Event, title: string) {
    options.tab.title = title;

    options.window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
      id: options.tab.id,
      title,
    });

    if (options.tab.url)
      options.historyService.updateTitle(options.tab.url.toString(), options.tab.title);
  }

  function onFaviconUpdated(_: Electron.Event, favicons: string[]) {
    const favicon = favicons[0];
    options.tab.favicon = favicon;

    options.window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
      id: options.tab.id,
      favicon,
    });
  }

  function onDidNavigate(_: Electron.Event, url: string) {
    options.tab.url = new URL(url);
    options.tab.title = options.tab.webContents.getTitle();

    if (options.isActiveTab(options.tab.id)) {
      options.window.navigation.updateState({
        canGoBack: options.tab.canGoBack,
        canGoForward: options.tab.canGoForward,
        input: options.tab.url?.toString(),
        isBookmarked: options.bookmarkService.isBookmarked(options.tab.url.toString()),
      });
    }

    options.historyService.add({
      title: options.tab.title,
      url: options.tab.url.toString(),
    });
  }

  function onDidStartLoading() {
    options.tab.isLoading = true;

    options.window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
      id: options.tab.id,
      isLoading: true,
    });
  }

  function onDidStopLoading() {
    options.tab.isLoading = false;
    options.tab.canGoBack = options.tab.webContents.navigationHistory.canGoBack();
    options.tab.canGoForward = options.tab.webContents.navigationHistory.canGoForward();

    updateTheme(options.tab.webContents, options.settings);

    options.window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
      id: options.tab.id,
      isLoading: false,
    });

    if (options.isActiveTab(options.tab.id)) {
      options.window.navigation.updateState({
        canGoBack: options.tab.canGoBack,
        canGoForward: options.tab.canGoForward,
        input: options.tab.url?.toString(),
      });
    }
  }

  function onDidFailLoad(_: Electron.Event, errCode: number) {
    // 無限ループが発生するのを防ぐ
    if (options.tab.url && options.tab.url.toString().startsWith(ERR_PAGES.directory))
      return;

    switch (errCode) {
      case ERR_CODES["server-notfound"]: {
        options.tab.loadURL(ERR_PAGES["server-notfound"]);
        break;
      }
      default: {
        options.tab.loadURL(ERR_PAGES.generic);
        console.warn("Undefined error code:", errCode);
        break;
      }
    }
  }

  function onAudioStateChanged(
    event: Electron.Event<Electron.WebContentsAudioStateChangedEventParams>
  ) {
    options.tab.isAudible = event.audible;

    options.window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
      id: options.tab.id,
      isAudible: options.tab.isAudible,
    });
  }

  function onBeforeUnload(event: Electron.Event) {
    const choice = dialog.showMessageBoxSync(options.window.getNativeWindow(), {
      type: "question",
      buttons: ["このページを離れる", "キャンセル"],
      title: "このページを離れますか？",
      message: "変更内容が保存されない可能性があります。",
      defaultId: 0,
      cancelId: 1,
    });

    const leave = choice === 0;
    if (leave) {
      event.preventDefault();
    }
  }

  const cleanupOnThemeChanged = options.eventBus.on("theme:updated", onThemeChanged);

  const cleanupOnResize = options.window.onResize(onResize);

  // 初期化イベント
  webContents.once("did-finish-load", onInit);

  // 通常イベント
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
    cleanupOnThemeChanged();

    cleanupOnResize();

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
    settings.themeService.getThemeById(settings.themeService.getCurrentThemeId())?.url
  );
}
