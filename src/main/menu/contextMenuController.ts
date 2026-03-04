// 開くコンテキストメニューのタイプを制御する

export class ContextMenuController {
  private lastContextType: "normal" | "tab" = "normal";

  setContextType(type: "normal" | "tab") {
    this.lastContextType = type;
    console.info(`Last context-menu type has changed: "${type}"`);
  }

  getContextType() {
    return this.lastContextType;
  }
}