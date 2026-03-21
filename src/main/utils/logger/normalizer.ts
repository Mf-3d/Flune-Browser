export type NormalizedLog = {
  message: string;
  stack?: string
};

export class Normalizer {
  normalize(err: Error | string): NormalizedLog {
    if (err instanceof Error) {
      return {
        message: err.message,
        stack: err.stack,
      }
    } else {
      return {
        message: err,
      }
    }
  }
}