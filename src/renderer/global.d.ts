import type { API } from "../../shared/types/preload-api";

declare global {
  interface Window {
    flune: API;
  }
}