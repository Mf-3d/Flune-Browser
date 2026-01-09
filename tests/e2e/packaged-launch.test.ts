import { _electron, test, expect, ElectronApplication } from "@playwright/test";
import fs from "node:fs";

test("packaged app launches and survives", async ({ }, testInfo) => {
  testInfo.setTimeout(120_000);

  let app: ElectronApplication | null = null;

  try {
    console.info("__dirname:", __dirname);
    console.info("cwd:", process.cwd());
    const executablePath = process.platform === "win32" ? "./dist/win-unpacked/Flune-Browser.exe" : "./dist/mac-arm64/Flune-Browser.app/Contents/MacOS/Flune-Browser";
    console.info("executablePath:", executablePath);
    if (executablePath) {
      console.info(fs.readdirSync("./dist/", {
        recursive: true
      }));

      console.info("win:", fs.existsSync("./dist/win-unpacked/Flune-Browser.exe"));
      console.info("mac:", fs.existsSync("./dist/mac-arm64/Flune-Browser.app/Contents/MacOS/"), fs.existsSync("./dist/mac-arm64/Flune-Browser.app/Contents/MacOS/Flune-Browser"));
      expect(fs.existsSync(executablePath)).toBeTruthy();
    }

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