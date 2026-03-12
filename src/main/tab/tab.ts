import { Window } from "@/main/window/window";

export class Tab {
  readonly id: string;

  url?: URL;
  title: string;
  favicon?: string;

  isLoading = false;
  canGoBack = false;
  canGoForward = false;

  isAudible = false;

  constructor(
    private readonly view: Electron.WebContentsView,
    private readonly onNewWindow: Function,
  ) {
    this.id = crypto.randomUUID();
    this.title = this.view.webContents.getTitle();

    this.webContents.setWindowOpenHandler((details) => {
      this.onNewWindow?.(details.url);

      return {
        action: "deny"
      };
    });
  }

  get webContents(): Electron.WebContents {
    return this.view.webContents;
  }

  close(options?: Electron.CloseOpts) {
    this.webContents.close(options);
  }

  getBounds(): Electron.Rectangle {
    return this.view.getBounds();
  }

  setBounds(bounds: Electron.Rectangle) {
    this.view.setBounds(bounds);
  }

  loadURL(input: string) {
    this.webContents.loadURL(input);

    this.url = new URL(input);
  }

  attachView(window: Window) {
    window.win.contentView.addChildView(this.view);
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

  toggleDevTools(options: Electron.OpenDevToolsOptions) {
    this.webContents.isDevToolsOpened()
      ? this.webContents.closeDevTools()
      : this.webContents.openDevTools(options);
  }
}