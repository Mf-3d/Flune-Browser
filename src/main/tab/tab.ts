import type { CloseOpts, OpenDevToolsOptions, Rectangle, WebContents, WebContentsView } from "electron";
import type { Window } from "@/main/window/window";
import type { TabOptions } from "./types";

export class Tab {
  readonly id: string;
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

  getBounds(): Rectangle {
    return this.view.getBounds();
  }

  setBounds(bounds: Rectangle) {
    this.view.setBounds(bounds);
  }

  loadURL(input: string) {
    this.webContents.loadURL(input);

    this.url = new URL(input);
  }

  attachView(window: Window) {
    window.win.contentView.addChildView(this.view);

    console.info(`Tab (${this.id}) has been attached to the window.`);
  }

  goBack() {
    if (this.canGoBack)
      this.webContents.navigationHistory.goBack();
  }

  goForward() {
    if (this.canGoForward)
      this.webContents.navigationHistory.goForward();
  }

  reload(options?: Partial<{
    /**
     * @default false
     */
    ignoreCache: boolean;
  }>) {
    if (!options?.ignoreCache) this.webContents.reload();
    else this.webContents.reloadIgnoringCache();
  }

  focus() {
    this.webContents.focus();
  }

  toggleDevTools(options?: OpenDevToolsOptions) {
    this.webContents.isDevToolsOpened()
      ? this.webContents.closeDevTools()
      : this.webContents.openDevTools(options);
  }

  setVisible(visible: boolean) {
    this.view.setVisible(visible);
  }
}