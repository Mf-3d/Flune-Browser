interface NavigationStatePayload {
  url?: string;
  isBookmarked?: boolean;
  canGoBack?: boolean;
  canGoForward?: boolean;
}; // NavigationState

interface NavigationInitPayload {
  themeURL: string;
  settings: any; // とりあえずanyでOK
}

interface FluneAPI {
  baseURL: string;

  toggleBookmark: () => void;
  updateSymbolColor: (color: string) => void;
  removeTab: (id: string) => void;
  switchTab: (id: string) => void;
  /**
   * @deprecated
   */
  toggleTabContextMenu: (id: string) => void;
  /**
   * @deprecated
   */
  load: (id: string, word: string) => void;
  focusPage: () => void;

  onStateUpdated: (callback: (event: Electron.IpcRendererEvent, payload: NavigationStatePayload) => void) => void;
  onInit: (callback: (event: Electron.IpcRendererEvent, payload: NavigationInitPayload) => void) => void;
  onThemeChanged: (callback: (event: Electron.IpcRendererEvent, themeUrl: string) => void) => void;
  /**
   * @deprecated
   */
  on: (channel: string, callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
}

interface Window {
  flune: FluneAPI;
  /**
   * @deprecated
   */
  toggleBookmark: () => void;
  /**
   * @deprecated
   */
  updateSymbolColor: () => void;
  /**
   * @deprecated
   */
  removeTab: (id: string) => void;
}