export type QuitContext = {
  forced: boolean;
  reason?: string;
};

export type RelaunchOptions =
  | {
      forced: false;
      reason?: string;
    }
  | {
      forced: true;
    };
