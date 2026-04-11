import { spawn } from "node:child_process";
import { app, dialog } from "electron";

import type { QuitContext, RelaunchOptions } from "./types";
import type { RuntimeContext } from "./runtime-context";

export class ApplicationService {
  constructor(
    private readonly runtime: RuntimeContext
  ) {}

  disableHardwareAcceleration() {
    if (!app.isReady()) app.disableHardwareAcceleration();
  }

  relaunch(
    /**
     * @default
     * ```ts
     * { forced: true }
     * ```
     */
    options?: RelaunchOptions
  ) {
    if (options && !options.forced) {
      const choice = dialog.showMessageBoxSync({
        type: "question",
        message: "本当に再起動しますか？",
        detail: `${options?.reason + "\n"}再起動するとすべてのタブを閉じます。`,
        buttons: ["再起動する", "キャンセル"],
        defaultId: 0,
        cancelId: 1,
      });

      if (choice === 0) this.relaunchApp();
    } else this.relaunchApp();
  }

  private relaunchApp() {
    switch (this.runtime.runtime) {
      case "vite-server":
        spawn("npm", ["run", "dev"], {
          detached: true,
          stdio: "ignore",
          shell: true,
        }).unref();
        app.exit(0);
        break;
      case "vite-preview":
        spawn("npm", ["run", "start"], {
          detached: true,
          stdio: "ignore",
          shell: true,
        }).unref();
        app.exit(0);
        break;
      case "production":
      case "dev":
        app.relaunch({ args: process.argv.slice(1).concat(["--relaunch"]) });
        app.exit(0);
        break;
    }
  }

  quit(context: QuitContext) {
    if (context.forced) app.quit();
    else {
      const choice = dialog.showMessageBoxSync({
        type: "question",
        message: "本当に終了しますか？",
        detail: "すべてのタブを閉じます。",
        buttons: ["終了する", "キャンセル"],
        defaultId: 0,
        cancelId: 1,
      });

      if (choice === 0) app.quit();
    }
  }
}
