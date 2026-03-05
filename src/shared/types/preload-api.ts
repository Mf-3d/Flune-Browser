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

export type API = 
  DefaultAPI & {
    navigation?: NavigationAPI;
    menu?: MenuAPI;
    settings?: SettingsAPI;
  };

export type DefaultAPI = {
  baseURL: string;
  getVersion: () => Promise<any>;
  getVersions: () => Promise<Versions>;
  getComputerInfo: () => Promise<ComputerInfo>;
  quit: (force?: boolean) => void;
  isSettingsPage: () => boolean;
  isNavigationPage: () => boolean;
};

export type NavigationAPI = {
  focusPage: () => void;
  tab: {
    create: () => void;
    activate: (id: string) => void;
    remove: (id: string) => void;
    move: (from: number, to: number) => void;
    navigate: (id: string | undefined, word: string) => void;
    reload: (options: {
      ignoringCache?: boolean | undefined;
    }) => void;
    goForward: () => void;
    goBack: () => void;
    goHome: () => void;
  };
  toggleBookmark: () => void;
  toggleOptionMenu: () => void;
  updateSymbolColor: (color: string) => void;
  onStateUpdated: (callback: (event: Electron.IpcRendererEvent, state: any) => void) => Electron.IpcRenderer;
  onInit: (callback: (event: Electron.IpcRendererEvent, state: any) => void) => Electron.IpcRenderer;
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