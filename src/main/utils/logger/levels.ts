// レベルの定義

export const LOG_LEVEL_PRIORITY = {
  info: 1,
  warn: 2,
  error: 3,
} as const;

export type LogLevel = keyof typeof LOG_LEVEL_PRIORITY;