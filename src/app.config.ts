import pkg from "../package.json";
import { AppMetadata } from "@/shared/types/app-metadata";

export const config: AppMetadata = {
  name: pkg.name,
  productName: "Flune-Browser",
  protocol: "flune",
};
