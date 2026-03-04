import path from "node:path";
import {
  BaseWindow,
  WebContentsView,
  Menu,
  ipcMain,
  dialog,
  app
} from "electron";
import { TabManager } from "@/main/window/tab";
import { buildOptionsMenu } from "@/main/menu/index";
import { ContextMenuManager } from "@/main/menu/context-menu";
import { OptionMenuManager } from "@/main/menu/option-menu";
// import theme from "@/main/lib/theme";\
import Event from "@/main/lib/event";
import { ContextMenuController } from "@/main/menu/contextMenuController";
import * as packageJson from "@/../package.json";
import { validateSender } from "@/main/ipc/validateSender";
import { BookmarkService } from "@/main/bookmark/service";
import { registerBookmarkHandler } from "@/main/ipc/bookmarkHandler";
import { DataManager } from "@/main/lib/data";
import { IPC_NOTIFY } from "@/shared/ipc/channels";
import { resolveView, ROUTE_MAP } from "@/shared/resolveView";
import { registerWindowEvents } from "./window-events";
import { createNavigationFeature, Navigation } from "../navigation/navigation-feature";
// import { Settings } from "@/main/settings/settings";
import { Settings } from "@/main/settings";
import { createSettings } from "../settings";

const SETTINGS_URL = resolveView(ROUTE_MAP.settings);
const VERSION_URL = resolveView(ROUTE_MAP.version);

const contextMenuController = new ContextMenuController();

ipcMain.handle("nav.set-context-type", (event, type) => {
  if (!event.senderFrame) return null;
  if (!validateSender(event.senderFrame)) return null;

  contextMenuController.setContextType(type);
});

// new window
export class Base {
  viewY: number = 66;
  readonly win: BaseWindow;
  readonly navigation: Navigation;
  bounds: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  } = {
      width: 800,
      height: 600
    };
  tabManager: TabManager;
  optionsMenu: Electron.Menu;
  readonly contextMenuManager: ContextMenuManager;
  readonly optionMenuManager: OptionMenuManager;

  constructor(
    private readonly data: DataManager,
    private readonly settings: Settings,
    private readonly event: Event,
    // private readonly settings: Settings,
    bounds?: {
      width: number;
      height: number;
      x: number;
      y: number;
    },

  ) {
    if (bounds) this.bounds = bounds;

    this.win = new BaseWindow(this.createWindowConstructorOptions());

    this.optionsMenu = buildOptionsMenu(this, this.data);
    this.contextMenuManager = new ContextMenuManager(this);
    this.optionMenuManager = new OptionMenuManager(this,
      this.data,
      {
        width: this.bounds.width,
        height: this.bounds.height - this.viewY,
        x: 0,
        y: this.viewY
      }
    );

    

    this.tabManager = new TabManager(
      this,
      this.data,
      {
        width: this.bounds.width,
        height: this.bounds.height - this.viewY,
        x: 0,
        y: this.viewY
      }
    );
    this.navigation = this.setupNavigation();

    

    registerWindowEvents(this.win, this.navigation, this.tabManager);
    registerBookmarkHandler(this.tabManager, this.data);

    this.event.on("theme-updated", (id) => {
      this.navigation?.updateTheme(id);
    });
    this.event.on("setting-updated", () => {
      this.navigation.send("flune.toggle-home-button", this.settings.store.get("settings").design.showHomeButton);
    });

    // IPCチャンネル
    ipcMain.handle("options.toggle", (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      // もし表示されていたとしても、オーバーレイに登録されているblurイベントが発火されるから必要ない。
      if (!this.optionMenuManager.isVisible()) this.optionMenuManager.show();
      // this.optionsMenu = buildOptionsMenu(this);
      // this.optionsMenu.popup();
    });
    ipcMain.handle("flune.update-symbol-color", (event, color?: string) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      if (process.platform === "win32" || process.platform === "linux") this.win.setTitleBarOverlay({
        symbolColor: color
      });
    });
    ipcMain.handle("flune.get-version", (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      return packageJson.version;
    });
    ipcMain.handle("flune.get-versions", (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      return {
        flune: packageJson.version,
        electron: process.versions.electron,
        node: process.versions.node,
        chrome: process.versions.chrome,
        v8: process.versions.v8,
      };
    });
    ipcMain.handle("flune.get-computer-info", (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      return {
        arch: process.arch,
        platform: process.platform,
      };
    });
    ipcMain.handle("flune.open-settings", (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      this.tabManager?.load(undefined, SETTINGS_URL);
    });
    ipcMain.handle("flune.show-versions-page", (event) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      this.tabManager?.load(undefined, VERSION_URL);
    });
    ipcMain.handle("flune.quit", (event, forced: boolean) => {
      if (!event.senderFrame) return null;
      if (!validateSender(event.senderFrame)) return null;

      if (forced) app.quit();

      const choice = dialog.showMessageBoxSync(this.win, {
        type: "question",
        message: "本当に終了しますか？",
        detail: `${this.tabManager?.tabs.length}個のタブを閉じます。`,
        buttons: ["終了する", "キャンセル"],
        defaultId: 0,
        cancelId: 1,
      });

      if (choice === 0) app.quit();
    });
  }

  private createWindowConstructorOptions(): Electron.BaseWindowConstructorOptions {
    return {
      width: this.bounds.width,
      height: this.bounds.height,
      minWidth: 300,
      minHeight: 300,
      x: this.bounds.x,
      y: this.bounds.y,
      title: `${app.getName()} ${(packageJson.version ?? "3")
        .replace("-beta.", " Beta ")
        .replace("-dev.", " Dev ")
        }`,
      titleBarStyle: "hidden",
      titleBarOverlay: process.platform === "darwin" ? true : {
        color: "#0000",
        symbolColor: "#fff",
      },
      show: true,
      icon: path.join(__dirname, "..", "..", "assets", "image", "icon.png"),
      trafficLightPosition: {
        x: 10,
        y: 8,
      }
    };
  }

  private setupNavigation(): Navigation {
    let currentTheme = this.settings.themeService.getThemeById(
      this.settings.themeService.getCurrentThemeId()
    );

    const navigation = createNavigationFeature(this.win, this.viewY, currentTheme?.url ?? "@theme/dark.css", () => {
      this.event.send("navigation-loaded");
    });

    navigation.attach();

    return navigation;
  }

  // updateTheme() {
  //   // テーマを追加
  //   const themeId = this.tabManager?.settings.config.get("settings.design.theme");
  //   const themes: {
  //     id: string;
  //     name: string;
  //     url: string;
  //   }[] = this.tabManager?.settings.config.get("themes") as {
  //     id: string;
  //     name: string;
  //     url: string;
  //   }[];
  //   const currentTheme = themes.find(theme => theme.id === themeId);

  //   currentTheme ? theme.appendTheme(this.nav.webContents, currentTheme.url) : "";
  // }

  /**
   * @deprecated
   */
  close() {
    this.win?.close();
  }
}