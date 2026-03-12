export const IPC_INVOKE = {
  APP_GET_VERSION: "app:get-version",
  APP_GET_VERSIONS: "app:get-versions",
  APP_GET_COMPUTER_INFO: "app:get-computer-info",
  APP_UPDATE_SYMBOL_COLOR: "app:update-symbol-color",
  APP_QUIT: "app:quit",

  BOOKMARK_TOGGLE: "bookmark:toggle",

  TAB_CREATE: "tab:create",
  TAB_REMOVE: "tab:remove",
  TAB_ACTIVATE: "tab:activate",
  TAB_MOVE: "tab:move",
  TAB_NAVIGATE: "tab:navigate",
  TAB_RELOAD: "tab:reload",

  TAB_GO_BACK: "tab:go-back",
  TAB_GO_FORWARD: "tab:go-forward",
  TAB_GO_HOME: "tab:go-home",

  VIEW_FOCUS: "view:focus",

  STORE_GET_ALL: "store:get-all",
  STORE_GET: "store:get",
  STORE_SET_ALL: "store:set-all",
  STORE_SET: "store:set",

  MENU_OPEN: "menu:open",
  MENU_CLOSE: "menu:close",
  // BOOKMARK_STATUS: "bookmark:status",
} as const;

// 一方向（レスポンスなし）
export const IPC_EVENTS = {

} as const;

export const IPC_NOTIFY = {
  NAVIGATION_INIT: "navigation:init",
  NAVIGATION_THEME: "navigation:theme",
  NAVIGATION_UPDATE: "navigation:update",

  TAB_CREATED: "tab:created",
  TAB_REMOVED: "tab:removed",
  TAB_UPDATED: "tab:updated",
  TAB_THEME: "tab:theme",
  
  TABS_REORDERED: "tabs:reordered",

  MENU_OPENING: "menu:opening",
  MENU_CLOSING: "menu:closing",
} as const;

export type IpcInvoke =
  typeof IPC_INVOKE[keyof typeof IPC_INVOKE];

export type IpcEvents =
  typeof IPC_EVENTS[keyof typeof IPC_EVENTS];

export type IpcNotify =
  typeof IPC_NOTIFY[keyof typeof IPC_NOTIFY];