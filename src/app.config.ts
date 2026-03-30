import pkg from "../package.json";

import type { AppMetadata } from "@/shared/types/app-metadata";

export const config: AppMetadata = {
  name: pkg.name,
  productName: "Flune-Browser",
  protocol: "flune",
};
