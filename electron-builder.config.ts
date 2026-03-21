import type { Configuration } from "electron-builder";

const config: Configuration = {
  appId: "io.github.mf-3d.flune-browser",
  productName: "Flune-Browser",
  artifactName: "${productName}-${version}-${platform}-${arch}.${ext}",
  files: ["assets/**/*", "out/**/*"],
  directories: {
    buildResources: "assets",
  },
  // publish: {
  //   provider: "github",
  //   releaseType: "draft",
  // },
  win: {
    icon: "assets/image/icon.png",
    target: ["nsis", "zip"],
    signtoolOptions: {
      publisherName: "mf7cli",
    },
  },
  nsis: {
    artifactName: "${productName}-${version}-${platform}-${arch}-installer.exe",
  },
  mac: {
    icon: "assets/image/icon.icns",
    category: "public.app-category.utilities",
    target: {
      target: "dmg",
      arch: "universal",
    },
    identity: null,
  },
  linux: {
    icon: "assets/image/icon.png",
    target: ["AppImage"],
    category: "Utility",
  },
};

export default config;
