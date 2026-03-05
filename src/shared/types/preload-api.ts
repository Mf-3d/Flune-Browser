export type Versions = {
  flune: string;
  electron: string;
  node: string;
  chrome: string;
  v8: string;
};

export type ComputerInfo = {
  arch: string;
  platform: string;
};

export type NavigationInit = {
  isMac: boolean;
  showHomeButton: boolean;
};

export type NavigationState = {
  isBookmarked?: boolean;
  canGoBack?: boolean;
  canGoForward?: boolean;
  showHomeButton?: boolean;
  /**
   * 検索ワード、またはURL
   */
  word?: string;
};

export type CreatedTab = {
  id: string;
  title: string;
  active: boolean;
  beforeTabId?: string;
};

export type TabState = {
  id: string;

  title?: string;
  active?: boolean;
  favicon?: string;
  isLoading?: boolean;
  isAudible?: boolean;
};

export type API = 
  DefaultAPI & {
    navigation?: NavigationAPI;
    menu?: MenuAPI;
    settings?: SettingsAPI;
    browser?: BrowserAPI;
  };

export type DefaultAPI = {
  baseURL: string;
  getVersion: () => Promise<any>;
  getVersions: () => Promise<Versions>;
  getComputerInfo: () => Promise<ComputerInfo>;
  quit: (force?: boolean) => void;
};

export type BrowserAPI = {
  onThemeChanged: (callback: (event: Electron.IpcRendererEvent, themeUrl: string) => void) => Electron.IpcRenderer;
};

export type NavigationAPI = {
  focusPage: () => void;
  tab: {
    create: () => void;
    activate: (id: string) => void;
    remove: (id: string) => void;
    move: (from: number, to: number) => void;
    navigate: (id: string | undefined, word: string) => void;
    reload: (options?: {
      ignoringCache?: boolean | undefined;
    }) => void;
    goForward: () => void;
    goBack: () => void;
    goHome: () => void;

    onCreated: (callback: (event: Electron.IpcRendererEvent, tab: CreatedTab) => void) => Electron.IpcRenderer;
    onRemoved: (callback: (event: Electron.IpcRendererEvent, id: string) => void) => Electron.IpcRenderer;
    onUpdated: (callback: (event: Electron.IpcRendererEvent, state: TabState) => void) => Electron.IpcRenderer;
  };
  toggleBookmark: () => void;
  toggleOptionMenu: () => void;
  updateSymbolColor: (color: string) => void;
  onStateUpdated: (callback: (event: Electron.IpcRendererEvent, state: NavigationState) => void) => Electron.IpcRenderer;
  onInit: (callback: (event: Electron.IpcRendererEvent, state: NavigationInit) => void) => Electron.IpcRenderer;
  onThemeChanged: (callback: (event: Electron.IpcRendererEvent, themeUrl: string) => void) => Electron.IpcRenderer;
};

export type MenuAPI = {
  open: () => void;
  close: () => void;
  bookmark: {
    getByFolderId: (folderId: string) => Promise<any>;
    add: () => void;
  };
};

export type SettingsAPI = {
  get: (key: string) => Promise<any>;
  getAll: () => Promise<any>;
  set: (key: string, value?: any) => void;
  setAll: (value?: any) => void;
};