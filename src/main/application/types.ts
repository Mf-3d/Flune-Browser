export type QuitContext = {
  forced: boolean;
};

export type RelaunchOptions =
  | {
      forced: false;
      reason?: string;
    }
  | {
      forced: true;
    };
