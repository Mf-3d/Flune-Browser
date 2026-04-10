import { IPC_NOTIFY } from "@/shared/ipc/channels";
import { ERR_CODES, ERR_PAGES } from "./types";
import { dialog, WebContents } from "electron";

import type { Settings } from "@/main/settings";
import type { TabEventContext } from "./types";

/**
 * @param tab
 * @param isActiveTab
 * @param window
 * @param settings
 * @param event
 * @returns Cleanup function.
 */
export function registerTabEvents(context: TabEventContext): () => void {
  const webContents = context.tab.webContents;

  function onInit() {
    if (context.isActiveTab(context.tab.id)) {
      context.window.navigation.updateState({
        canGoBack: context.tab.canGoBack,
        canGoForward: context.tab.canGoForward,
        input: context.tab.url?.toString(),
        isBookmarked: context.bookmarkService.isBookmarked(context.tab.url!.toString()),
      });
    }
  }

  function onResize() {
    const winBounds = context.window.getContentBounds();
    const tabBounds = context.tab.getBounds();

    context.tab.setBounds({
      x: tabBounds.x,
      y: tabBounds.y,
      width: winBounds.width,
      height: winBounds.height - context.window.viewY,
    });
  }

  function onThemeChanged() {
    updateTheme(context.tab.webContents, context.settings);
  }

  function onTitleUpdated(_: Electron.Event, title: string) {
    context.tab.title = title;

    context.window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
      id: context.tab.id,
      title,
    });

    if (context.tab.url)
      context.historyService.updateTitle(context.tab.url.toString(), context.tab.title);
  }

  function onFaviconUpdated(_: Electron.Event, favicons: string[]) {
    const favicon = favicons[0];
    context.tab.favicon = favicon;

    context.window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
      id: context.tab.id,
      favicon,
    });
  }

  function onDidNavigate(_: Electron.Event, url: string) {
    context.tab.url = new URL(url);
    context.tab.title = context.tab.webContents.getTitle();

    if (context.isActiveTab(context.tab.id)) {
      context.window.navigation.updateState({
        canGoBack: context.tab.canGoBack,
        canGoForward: context.tab.canGoForward,
        input: context.tab.url?.toString(),
        isBookmarked: context.bookmarkService.isBookmarked(context.tab.url.toString()),
      });
    }

    context.historyService.add({
      title: context.tab.title,
      url: context.tab.url.toString(),
    });
  }

  function onDidStartLoading() {
    context.tab.isLoading = true;

    context.window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
      id: context.tab.id,
      isLoading: true,
    });
  }

  function onDidStopLoading() {
    context.tab.isLoading = false;
    context.tab.canGoBack = context.tab.webContents.navigationHistory.canGoBack();
    context.tab.canGoForward = context.tab.webContents.navigationHistory.canGoForward();

    updateTheme(context.tab.webContents, context.settings);

    context.window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
      id: context.tab.id,
      isLoading: false,
    });

    if (context.isActiveTab(context.tab.id)) {
      context.window.navigation.updateState({
        canGoBack: context.tab.canGoBack,
        canGoForward: context.tab.canGoForward,
        input: context.tab.url?.toString(),
      });
    }
  }

  function onDidFailLoad(_: Electron.Event, errCode: number) {
    // 無限ループが発生するのを防ぐ
    if (context.tab.url && context.tab.url.toString().startsWith(ERR_PAGES.directory))
      return;

    switch (errCode) {
      case ERR_CODES["server-notfound"]: {
        context.tab.loadURL(ERR_PAGES["server-notfound"]);
        break;
      }
      default: {
        context.tab.loadURL(ERR_PAGES.generic);
        context.logger.warn(`Undefined error code: ${errCode}`);
        break;
      }
    }
  }

  function onAudioStateChanged(
    event: Electron.Event<Electron.WebContentsAudioStateChangedEventParams>
  ) {
    context.tab.isAudible = event.audible;

    context.window.navigation.send(IPC_NOTIFY.TAB_UPDATED, {
      id: context.tab.id,
      isAudible: context.tab.isAudible,
    });
  }

  function onBeforeUnload(event: Electron.Event) {
    const choice = dialog.showMessageBoxSync(context.window.getNativeWindow(), {
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

  function onWebRequestErrorOccurred(details: Electron.OnErrorOccurredListenerDetails) {
    context.logger.error(
      new Error(`An error occurred in WebRequest: "${details.error}"; URL: "${details.url}".`, {
        cause: details.error,
      })
    );
  }

  const cleanupOnThemeChanged = context.eventBus.on("theme:updated", onThemeChanged);

  const cleanupOnResize = context.window.onResize(onResize);

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
  webContents.session.webRequest.onErrorOccurred(onWebRequestErrorOccurred);

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
