import type { Window } from "@/main/window/window";

export type QuitContext =
  | {
      forced: false;
      window: Window;
    }
  | {
      forced: true;
    };

export type RelaunchOptions =
  | {
      forced: false;
      reason?: string;
    }
  | {
      forced: true;
    };
