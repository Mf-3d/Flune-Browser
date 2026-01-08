import { _electron, test, expect, ElectronApplication } from "@playwright/test";

test("packaged app launches and survives", async ({}, testInfo) => {
  testInfo.setTimeout(30_000);

  let app: ElectronApplication | null = null;

  try {
    console.debug(__dirname);
    app = await _electron.launch({
      executablePath: process.env.ELECTRON_EXECUTABLE_PATH,
    });

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