export const RUNTIME_TYPES = ["vite-server", "vite-preview", "production", "dev"] as const;

export type RuntimeType = (typeof RUNTIME_TYPES)[number];

export function isRuntimeType(value: string): value is RuntimeType {
  return (RUNTIME_TYPES as readonly string[]).includes(value);
}

export function parseRuntimeType(value?: string): RuntimeType {
  if (value && isRuntimeType(value)) {
    return value;
  }
  return "production";
}