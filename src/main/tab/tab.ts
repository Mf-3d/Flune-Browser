import { Window } from "@/main/window/window";
import { CloseOpts, OpenDevToolsOptions, Rectangle, WebContents, WebContentsView } from "electron";

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
    private readonly view: WebContentsView,
    bounds: Rectangle,
    private readonly onNewWindow: Function,
  ) {
    this.id = crypto.randomUUID();
    this.title = this.view.webContents.getTitle();

    this.setBounds(bounds);

    this.webContents.setWindowOpenHandler((details) => {
      this.onNewWindow?.(details.url);

      return {
        action: "deny"
      };
    });
  }

  get webContents(): WebContents {
    return this.view.webContents;
  }

  close(options?: CloseOpts) {
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

  toggleDevTools(options?: OpenDevToolsOptions) {
    this.webContents.isDevToolsOpened()
      ? this.webContents.closeDevTools()
      : this.webContents.openDevTools(options);
  }

  setVisible(visible: boolean) {
    this.view.setVisible(visible);
  }
}