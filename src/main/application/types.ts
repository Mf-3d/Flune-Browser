import type { Window } from "@/main/window/window";

export type RuntimeContext = {
  sessionId: string;
  logDir: string;
  log: {
    app: string;
    chromium: string;
    chromiumNet: string;
  };
};

export type QuitContext =
  | {
      forced: false;
      window: Window;
    }
  | {
      forced: true;
    };
