import type { MenuActionDescriptor, MenuPageId, OptionMenuItem } from "./menu";
import type { Config } from "./config";
import type { Path, PathValue } from "./path";
import { IpcRenderer, IpcRendererEvent } from "electron";

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

export type NavigationContext = {
  isMac: boolean;
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

export type API = DefaultAPI & {
  navigation?: NavigationAPI;
  menu?: MenuAPI;
  settings?: SettingsAPI;
  browser?: BrowserAPI;
};

export type DefaultAPI = {
  baseURL: string;
  logger: {
    debug: (message: string) => void;
    info: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string | Error) => void;
  };
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

  onThemeChanged: (
    callback: (event: IpcRendererEvent, themeUrl: string) => void
  ) => IpcRenderer;
};

export type NavigationAPI = {
  focusPage: () => void;
  tab: {
    create: () => void;
    activate: (id: string) => void;
    remove: (id: string) => void;
    move: (id: string, targetId: string, position: "before" | "after") => void;
    navigate: (id: string | undefined, input: string) => void;
    reload: (options?: { ignoringCache?: boolean | undefined }) => void;
    goForward: () => void;
    goBack: () => void;
    goHome: () => void;

    onCreated: (
      callback: (event: IpcRendererEvent, tab: CreatedTab) => void
    ) => IpcRenderer;
    onRemoved: (callback: (event: IpcRendererEvent, id: string) => void) => IpcRenderer;
    onUpdated: (
      callback: (event: IpcRendererEvent, state: TabState) => void
    ) => IpcRenderer;

    onReordered: (
      callback: (event: IpcRendererEvent, order: string[]) => void
    ) => IpcRenderer;
  };
  toggleBookmark: () => void;
  toggleOptionMenu: () => void;
  updateSymbolColor: (color: string) => void;
  onStateUpdated: (
    callback: (event: IpcRendererEvent, state: NavigationState) => void
  ) => IpcRenderer;
  onInit: (
    callback: (event: IpcRendererEvent, state: NavigationContext) => void
  ) => IpcRenderer;
  onThemeChanged: (
    callback: (event: IpcRendererEvent, themeUrl: string) => void
  ) => IpcRenderer;
};

export type MenuAPI = {
  open: () => void;
  close: () => void;
  getPage: (pageId: MenuPageId) => Promise<OptionMenuItem[]>;
  clickItem: (action: MenuActionDescriptor) => void;
  bookmark: {
    getByFolderId: (folderId: string) => Promise<any>;
    add: () => void;
  };
  onOpening: (callback: (event: IpcRendererEvent) => void) => IpcRenderer;
  onClosing: (callback: (event: IpcRendererEvent) => void) => IpcRenderer;
};

export type SettingsAPI = {
  get<P extends Path<Config>>(key: P): Promise<PathValue<Config, P>>;
  set<P extends Path<Config>>(key: P, value?: PathValue<Config, P>): Promise<void>;
  getAll: () => Promise<Config>;
  setAll: (config?: Config) => Promise<void>;
};
