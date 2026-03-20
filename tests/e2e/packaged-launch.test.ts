import { _electron, test, expect, ElectronApplication } from "@playwright/test";
import fs from "node:fs";

test("packaged app launches and survives", async ({}, testInfo) => {
  testInfo.setTimeout(120_000);

  let app: ElectronApplication | null = null;

  try {
    console.info("cwd:", process.cwd());
    // 余計な文字（キャリッジリターンや改行、空白）を消去する。
    const executablePath = process.env.ELECTRON_EXECUTABLE_PATH?.trim();
    console.info("executable path:", executablePath);

    app = await _electron.launch({
      executablePath: executablePath,
    });

    const isPackaged = await app.evaluate(async ({ app }) => {
      return app.isPackaged;
    });
    console.info("is packaged:", isPackaged);

    const window = await app.firstWindow();

    // ウィンドウが存在する＝起動成功
    expect(window).toBeTruthy();

    // 3秒生存（即クラッシュ防止）
    await new Promise((r) => setTimeout(r, 3000));
  } finally {
    if (app) {
      await app.close();
    }
  }
});

// $env:ELECTRON_EXECUTABLE_PATH="{path}"
// npm t
