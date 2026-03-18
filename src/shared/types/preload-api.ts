import type { MenuId, OptionMenuItem } from "./menu";
import type { Config } from "./config";
import type { Path, PathValue } from "./path";

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
  showHomeButton: boolean;
};

export type NavigationState = Partial<{
  isBookmarked: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  showHomeButton: boolean;
  input: string;
}>;

export type CreatedTab = {
  id: string;
  title: string;
  active: boolean;
  beforeTabId?: string;
};

export type TabState = {
  id: string;
} & Partial<{
  title: string;
  active: boolean;
  favicon: string;
  isLoading: boolean;
  isAudible: boolean;
}>;

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
  /**
   * Shows settings page in the active tab.
   */
  showSettingsPage: () => void;
  /**
   * Shows versions page in the active tab.
   */
  showVersionsPage: () => void;
  quit: (force?: boolean) => void;
};

export type BrowserAPI = {
  navigate: (input: string) => void;

  onThemeChanged: (callback: (event: Electron.IpcRendererEvent, themeUrl: string) => void) => Electron.IpcRenderer;
};

export type NavigationAPI = {
  focusPage: () => void;
  tab: {
    create: () => void;
    activate: (id: string) => void;
    remove: (id: string) => void;
    move: (id: string, targetId: string, position: "before" | "after") => void;
    navigate: (id: string | undefined, input: string) => void;
    reload: (options?: {
      ignoringCache?: boolean | undefined;
    }) => void;
    goForward: () => void;
    goBack: () => void;
    goHome: () => void;

    onCreated: (callback: (event: Electron.IpcRendererEvent, tab: CreatedTab) => void) => Electron.IpcRenderer;
    onRemoved: (callback: (event: Electron.IpcRendererEvent, id: string) => void) => Electron.IpcRenderer;
    onUpdated: (callback: (event: Electron.IpcRendererEvent, state: TabState) => void) => Electron.IpcRenderer;

    onReordered: (callback: (event: Electron.IpcRendererEvent, order: string[]) => void) => Electron.IpcRenderer;
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
  clickItem: (menuId: MenuId) => void;
  bookmark: {
    getByFolderId: (folderId: string) => Promise<any>;
    add: () => void;
  };
  onOpening: (callback: (event: Electron.IpcRendererEvent, template: OptionMenuItem[]) => void) => Electron.IpcRenderer;
  onClosing: (callback: (event: Electron.IpcRendererEvent) => void) => Electron.IpcRenderer;
};

export type SettingsAPI = {
  get<P extends Path<Config>>(key: P): Promise<PathValue<Config, P>>;
  set<P extends Path<Config>>(key: P, value?: PathValue<Config, P>): Promise<void>;
  getAll: () => Promise<Config>;
  setAll: (config?: Config) => Promise<void>;
};