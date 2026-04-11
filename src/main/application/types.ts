import type { Window } from "@/main/window/window";

/**
 * @deprecated
 */
export type RuntimeContext = {
  runtime: "vite-server" | "vite-preview" | "production" | "dev";
  sessionId: string;
  /**
   * Returns the output location for the log file in the current session.
   */
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

export type RelaunchOptions =
  | {
      forced: false;
      reason?: string;
    }
  | {
      forced: true;
    };
