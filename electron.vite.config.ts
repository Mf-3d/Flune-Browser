import path from "node:path";
import { defineConfig } from "electron-vite";

export default defineConfig({
  main: {
    resolve: {
      alias: {
        "@": path.resolve("src/"),
      },
    },
    build: {
      lib: {
        entry: "src/main/main.ts",
      },
    },
  },
  preload: {
    resolve: {
      alias: {
        "@": path.resolve("src/"),
      },
    },
    build: {
      lib: {
        entry: "src/preload/index.ts",
        formats: ["cjs"],
        fileName: () => "preload.js",
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
    },
  },
  renderer: {
    root: "src/renderer",
    resolve: {
      alias: {
        "@": path.resolve("src/"),
      },
    },
    build: {
      rollupOptions: {
        input: {
          navigation: path.resolve(__dirname, "src/renderer/navigation/index.html"),
          home: path.resolve(__dirname, "src/renderer/browser/home/index.html"),
          settings: path.resolve(__dirname, "src/renderer/browser/settings/index.html"),
          version: path.resolve(__dirname, "src/renderer/browser/version/index.html"),
          error: path.resolve(__dirname, "src/renderer/browser/error/error.html"),
          serverNotFound: path.resolve(
            __dirname,
            "src/renderer/browser/error/server-notfound.html"
          ),
          optionMenu: path.resolve(__dirname, "src/renderer/menu/index.html"),
        },
      },
    },
  },
});
