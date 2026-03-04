// 開くコンテキストメニューのタイプを制御する

/**
 * @class
 * @deprecated
 */
export class ContextMenuController {
  private lastContextType: "normal" | "tab" = "normal";

  /**
   * @deprecated
   */
  setContextType(type: "normal" | "tab") {
    this.lastContextType = type;
    console.info(`Last context-menu type has changed: "${type}"`);
  }
  
  /**
   * @deprecated
   */
  getContextType() {
    return this.lastContextType;
  }
}