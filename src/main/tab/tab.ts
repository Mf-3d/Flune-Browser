import type {
  CloseOpts,
  OpenDevToolsOptions,
  WebContents,
  WebContentsView,
} from "electron";
import type { Window } from "@/main/window/window";
import type { TabOptions } from "./types";
import type { Rect } from "@/shared/types/rect";

export class Tab {
  readonly id: string;

  private readonly logger;
  private readonly view: WebContentsView;

  url?: URL;
  title: string;
  favicon?: string;

  isLoading = false;
  canGoBack = false;
  canGoForward = false;

  isAudible = false;

  cleanupEvents?: () => void;

  constructor(options: TabOptions) {
    this.logger = options.logger;
    this.view = options.view;

    this.id = crypto.randomUUID();
    this.title = this.view.webContents.getTitle();

    this.setBounds(options.bounds);
  }

  get webContents(): WebContents {
    return this.view.webContents;
  }

  close(options?: CloseOpts) {
    this.cleanupEvents?.();
    this.webContents.close(options);
  }

  getBounds(): Rect {
    return this.view.getBounds();
  }

  setBounds(bounds: Rect) {
    this.view.setBounds(bounds);
  }

  loadURL(input: string) {
    this.webContents.loadURL(input);

    this.url = new URL(input);
  }

  attachView(window: Window, visible: boolean = false) {
    this.setVisible(visible);
    window.appendView(this.view);

    this.logger.info(`Tab (${this.id}) has been attached to the window.`);
  }

  goBack() {
    if (this.canGoBack) this.webContents.navigationHistory.goBack();
  }

  goForward() {
    if (this.canGoForward) this.webContents.navigationHistory.goForward();
  }

  reload(
    options?: Partial<{
      /**
       * @default false
       */
      ignoreCache: boolean;
    }>
  ) {
    if (!options?.ignoreCache) this.webContents.reload();
    else this.webContents.reloadIgnoringCache();
  }

  focus() {
    this.webContents.focus();
  }

  toggleDevTools(options?: OpenDevToolsOptions) {
    if (this.webContents.isDevToolsOpened()) {
      this.webContents.closeDevTools();
    } else {
      // ここでoptionsを渡したいのでWebContents.toggleDevTools()は使えない。
      this.webContents.openDevTools(options);
    }
  }

  setVisible(visible: boolean) {
    this.view.setVisible(visible);
  }
}
