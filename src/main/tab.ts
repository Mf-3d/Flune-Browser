import * as path from "node:path";
import { 
  BaseWindow,
  WebContentsView,
  ipcMain
} from "electron";
import { Base } from "./base-window";

export type Tab = {
  id: string;
  title: string;
  entity: WebContentsView;
  active: boolean;
}

// 内部ページのパス
const HOME_URL = path.join("file://", __dirname, "..", "renderer", "browser", "home.html");

// タブ管理
export class TabManager {
  private base: Base;
  tabs: Tab[] = [];
  private bounds: {
    width: number;
    height: number;
    x: number;
    y: number;
  } = {
    width: 800,
    height: 600,
    x: 0,
    y: 0
  };
  activeCurrent?: string; // 現在有効化されているタブのID

  constructor (base: Base, bounds?: {width: number; height: number; x: number; y: number}) {
    this.base = base;
    if (bounds) this.bounds = bounds;

    this.base.win.on('resize', () => {
      if (!this.base) return;

      const bounds = this.base.win.getBounds();
      [this.bounds.width, this.bounds.height] = [bounds.width, bounds.height];
    });

    // IPCチャンネル
    ipcMain.handle("tab.switch", (event, id) => {
      this.activateTab(id);
    });

    ipcMain.handle('tab.new', (event) => {
      this.newTab(undefined, true);
    });

    ipcMain.handle('tab.remove', (event, id) => {
      this.removeTab(id);
    });
  }

  // IDからタブを取得
  getTabById (id: string): Tab | undefined {
    return this.tabs.find(tab => (tab.id === id));
  }

  // 新規タブ
  newTab (url?: string, active: boolean = true): Tab {
    if (!url) url = HOME_URL;

    // ビューを作成
    let entity = new WebContentsView();
    entity.setBounds(this.bounds);
    entity.webContents.loadURL(url);
    
    this.base.win.on('resize', () => {
      if (!this.base || !entity) return;

      const bounds = this.base.win.getBounds();

      entity.setBounds({
        x: this.bounds.x,
        y: this.bounds.y,
        width: bounds.width,
        height: bounds.height,
      });
    });

    let title: string = entity.webContents.getTitle();
    let newTab: Tab = {
      id: crypto.randomUUID(),
      title: title ? title : url,
      entity,
      active
    };

    this.tabs?.push(newTab); // 配列に追加
    this.base.win.contentView.addChildView(newTab.entity);

    const tabInfo = {
      id: newTab.id,
      title: newTab.title,
      active: newTab.active
    }
    this.base.send("tab.new", tabInfo);

    if (active) this.activateTab(newTab.id);

    return newTab;
  }

  // タブを削除
  removeTab (id: string) {
    const tab = this.getTabById(id);

    if (!tab) {
      console.error("Could not remove tab: Tab does not exist.");
      return;
    }

    const i = this.tabs.indexOf(tab);

    tab.entity.webContents.close();
    this.base.send("tab.remove", id);

    // 別のタブをアクティブ化
    if (i !== -1) {
      if (this.tabs.length <= 1) this.base.close();
      
      this.activateTab(this.tabs[i > 0 ? i - 1 : 0].id);
    }

    // 最後に配列から削除
    this.tabs.splice(i, 1);
  }

  // タブをアクティブ化
  activateTab (id: string): Tab | undefined {
    const activeTab = this.getTabById(id);

    if (!activeTab) {
      console.error("Could not set tab as active: Tab does not exist.");
      return;
    }

    // タブをアクティブ化
    this.tabs = this.tabs.map(tab => ({
      ...tab,
      active: tab.id === id
    }));

    this.activeCurrent = id;
    
    this.tabs.forEach(tab => {
      tab.active ? tab.entity.setVisible(true) : tab.entity.setVisible(false);
    });

    // レンダラーにも反映
    this.base.send("tab.activate", activeTab.id);

    return activeTab;
  }

  // タブを移動
  moveTab (fromIndex: number, toIndex: number) {
    if (fromIndex < 0 || fromIndex >= this.tabs.length || toIndex < 0 || toIndex >= this.tabs.length) {
      console.error("Invalid indices");
      return;
    }
  
    const [movedTab] = this.tabs.splice(fromIndex, 1);
    this.tabs.splice(toIndex, 0, movedTab);
  }

  // 再読み込みする
  reloadTab (id: string | undefined = this.activeCurrent, ignoringCache: boolean = false) {
    if (!id) {
      console.error("Could not reload tab: Tab ID not specified or active tab does not exist.");
      return;
    }

    const tab = this.getTabById(id);

    if (!tab) {
      console.error("Could not reload tab: Tab does not exist.");
      return;
    }

    ignoringCache ? tab.entity.webContents.reloadIgnoringCache : tab.entity.webContents.reload();
  }

  // 前に戻る
  goBack (id: string | undefined = this.activeCurrent) {
    if (!id) {
      console.error("Could not go back: Tab ID not specified or active tab does not exist.");
      return;
    }

    const tab = this.getTabById(id);

    if (!tab) {
      console.error("Could not go back: Tab does not exist.");
      return;
    }

    tab.entity.webContents.navigationHistory.goBack();
  }

  // 次に進む
  goForward (id: string | undefined = this.activeCurrent) {
    if (!id) {
      console.error("Could not go forward: Tab ID not specified or active tab does not exist.");
      return;
    }

    const tab = this.getTabById(id);

    if (!tab) {
      console.error("Could not go forward: Tab does not exist.");
      return;
    }

    tab.entity.webContents.navigationHistory.goForward();
  }

  close () {
    this.tabs.forEach((tab) => {
      if (!tab) return;
      tab.entity.webContents.close();
    });
  }
}