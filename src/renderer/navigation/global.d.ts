interface NavigationStatePayload {
  url?: string;
  isBookmarked?: boolean;
  canGoBack?: boolean;
  canGoForward?: boolean;
}; // NavigationState

interface NavigationInitPayload {
  themeId: string;
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

  onStateUpdated: (callback: (event: Electron.IpcRendererEvent, payload: NavigationStatePayload) => void) => void;
  onInit: (callback: (event: Electron.IpcRendererEvent, payload: NavigationInitPayload) => void) => void;
  /**
   * @deprecated
   */
  on: (channel: string, callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
}

interface Window {
  flune: FluneAPI;
}