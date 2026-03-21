import type { Window } from "@/main/window/window";

export type RuntimeContext = {
  sessionId: string;
  logDir: string;
  logFilePath: string;
};

export type QuitOptions =
  | {
      forced: false;
      window: Window;
    }
  | {
      forced: true;
    };