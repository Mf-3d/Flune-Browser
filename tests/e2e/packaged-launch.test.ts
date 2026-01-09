import { _electron, test, expect, ElectronApplication } from "@playwright/test";
import path from "node:path";

test("packaged app launches and survives", async ({}, testInfo) => {
  testInfo.setTimeout(120_000);

  let app: ElectronApplication | null = null;

  try {
    console.info("__dirname:", __dirname);

    const executablePath = process.env.ELECTRON_EXECUTABLE_PATH ? path.resolve(process.env.ELECTRON_EXECUTABLE_PATH) : undefined;
    console.info("executablePath:", executablePath);

    app = await _electron.launch({
      executablePath: executablePath,
    });

    const isPackaged = await app.evaluate(async ({ app }) => {
      return app.isPackaged;
    });
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
// "dist/win-unpacked/Flune-Browser.exe" or "dist/mac/Flune-Browser.app/Contents/MacOS/Flune-Browser"
// npm t