import { Tab } from "./tab";

export class TabCollection {
  private tabs: Tab[] = [];
  private activeTabId?: string;

  get length() {
    return this.tabs.length;
  }

  add(tab: Tab, beforeTabId?: string): number {
    if (beforeTabId) {
      const position = this.tabs.findIndex((beforeTab) => beforeTab.id === beforeTabId);
      this.tabs.splice(position, 0, tab);
    } else {
      this.tabs.push(tab);
    }

    return this.tabs.indexOf(tab);
  }

  // move(id: string, targetId: string, position: "before" | "after") {
  //   const from = this.getIndex(id);
  //   const to =
  //     position === "before"
  //       ? this.getIndex(targetId)
  //       : this.getIndex(targetId) + 1;

  //   if (from < 0 || from >= this.tabs.length || to < 0 || to >= this.tabs.length) {
  //     throw new Error("Invalid indices.");
  //   }

  //   const insertIndex = from < to ? to : to + 1;
  //   const [movedTab] = this.tabs.splice(from, 1);

  //   if (movedTab) {
  //     this.tabs.splice(insertIndex, 0, movedTab);
  //   } else {
  //     throw new Error("Moved tab does not exist.");
  //   }
  // }

  move(fromIndex: number, toIndex: number) {
    if (fromIndex < 0 || fromIndex >= this.tabs.length || toIndex < 0 || toIndex >= this.tabs.length) {
      throw new Error("Invalid indices.");
    }
    
    const [movedTab] = this.tabs.splice(fromIndex, 1);

    if (movedTab) {
      this.tabs.splice(toIndex, 0, movedTab);
    } else {
      throw new Error("Moved tab does not exist.");
    }
  }

  remove(id: string) {
    this.tabs = this.tabs.filter(t => t.id !== id);
  }

  removeAll() {
    this.tabs = [];
  }

  at(index: number) {
    return this.tabs.at(index);
  }

  get(id: string) {
    return this.tabs.find(t => t.id === id);
  }

  getIndex(id: string) {
    return this.tabs.findIndex(t => t.id === id);
  }

  getAll() {
    return this.tabs;
  }

  getActive() {
    return this.get(this.activeTabId!);
  }

  setActive(id: string) {
    this.activeTabId = id;
  }

  isActive(id: string): boolean {
    return this.getActive()?.id === id;
  }
};