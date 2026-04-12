// レベルの定義

export const LOG_LEVEL_PRIORITY = {
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
} as const;

export type LogLevel = keyof typeof LOG_LEVEL_PRIORITY;
