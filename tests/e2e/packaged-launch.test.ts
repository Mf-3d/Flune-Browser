import { _electron, test, expect, ElectronApplication } from "@playwright/test";
import path from "node:path";

test("packaged app launches and survives", async ({}, testInfo) => {
  testInfo.setTimeout(60_000);

  let app: ElectronApplication | null = null;

  try {
    app = await _electron.launch({
      executablePath: process.env.ELECTRON_EXECUTABLE_PATH ? path.resolve(process.env.ELECTRON_EXECUTABLE_PATH) : undefined,
    });

    const isPackaged = await app.evaluate(async ({ app }) => {
      return app.isPackaged;
    });
    console.info("__dirname:", __dirname);
    console.info("isPackaged:", isPackaged);

    const window = await app.firstWindow();

    // ウィンドウが存在する＝起動成功
    expect(window).toBeTruthy();

    // 3秒生存（即クラッシュ防止）
    await new Promise(r => setTimeout(r, 3000));
  } finally {
    if (app) {
      await app.close();
    }
  }
});

// $env:ELECTRON_EXECUTABLE_PATH="{path}"
// npm t