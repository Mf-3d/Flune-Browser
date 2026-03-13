import type { Window } from "@/main/window/window";

export type QuitOptions = {
  forced: false;
  window: Window;
} | {
  forced: true;
};