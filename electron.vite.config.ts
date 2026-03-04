import { defineConfig } from "electron-vite";
import path from "path";

export default defineConfig({
  main: {
    resolve: {
      alias: {
        "@": path.resolve("src/"), // 追加
      },
    },
    build: {
      lib: {
        entry: "src/main/main.ts",
      },
    },
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          browser: path.resolve(__dirname, "src/preload/browser.ts"),
          menu: path.resolve(__dirname, "src/preload/menu.ts"),
          navigation: path.resolve(__dirname, "src/preload/navigation.ts"),
          settings: path.resolve(__dirname, "src/preload/settings.ts"),
        }
      }
    }
  },
  renderer: {
    root: "src/renderer",
    build: {
      rollupOptions: {
        input: {
          navigation: path.resolve(__dirname, "src/renderer/navigation/navigation.html"),
          home: path.resolve(__dirname, "src/renderer/browser/home.html"),
          settings: path.resolve(__dirname, "src/renderer/browser/settings.html"),
          version: path.resolve(__dirname, "src/renderer/browser/version.html"),
          error: path.resolve(__dirname, "src/renderer/browser/error/error.html"),
          serverNotFound: path.resolve(__dirname, "src/renderer/browser/error/server-notfound.html"),
          menuBookmarks: path.resolve(__dirname, "src/renderer/menu/bookmarks.html"),
          menuTop: path.resolve(__dirname, "src/renderer/menu/index.html"),
        }
      }
    }
  }
});