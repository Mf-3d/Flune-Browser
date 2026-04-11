import pkg from "../package.json";

import type { AppMetadata } from "@/shared/types/app-metadata";

export const config: AppMetadata = {
  name: pkg.name,
  versions: {
    app: pkg.version,
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome,
  },
  version: pkg.version,
  productName: "Flune-Browser",
  protocol: "flune",
  github: "https://github.com/mf-3d/flune-browser/",
};
