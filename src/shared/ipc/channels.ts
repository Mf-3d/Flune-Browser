export const IPC_INVOKE = {
  BOOKMARK_TOGGLE: "bookmark:toggle",
  TAB_CREATE: "tab:create",
  TAB_REMOVE: "tab:remove",
  TAB_ACTIVATE: "tab:activate",
  TAB_FOCUS: "tab:focus",
  STORE_GET_ALL: "store:get-all",
  STORE_GET: "store:get",
  STORE_SET_ALL: "store:set-all",
  STORE_SET: "store:set",
  // BOOKMARK_STATUS: "bookmark:status",
} as const;

// 一方向（レスポンスなし）
export const IPC_EVENTS = {
  
} as const;

export const IPC_NOTIFY = {
  NAVIGATION_INIT: "navigation:init",
  NAVIGATION_APPLY_THEME: "navigation:apply-theme",
  NAVIGATION_STATE: "navigation:state",
  TAB_CREATED: "tab:created",
  TAB_REMOVED: "tab:removed",
  TAB_UPDATED: "tab:updated",
} as const;

export type IpcInvoke =
  typeof IPC_INVOKE[keyof typeof IPC_INVOKE];

export type IpcEvents =
  typeof IPC_EVENTS[keyof typeof IPC_EVENTS];

export type IpcNotify =
  typeof IPC_NOTIFY[keyof typeof IPC_NOTIFY];