import { handle } from "@/main/ipc/handler";
import Event from "@/main/lib/event";
import { IPC_INVOKE } from "@/shared/ipc/channels";

import type { Settings } from "..";

function getNested(obj: any, path: string) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

function setNested(obj: any, path: string, value: unknown) {
  const keys = path.split(".");
  const last = keys.pop()!;
  const target = keys.reduce((acc, key) => acc[key], obj);
  target[last] = value;
}

export function registerSettingsHandler(settings: Settings, event: Event) {
  handle(IPC_INVOKE.STORE_GET_ALL, (_) => {
    return settings.store.getAll();
  });
  handle(IPC_INVOKE.STORE_GET, (_, key: string) => {
    const root = settings.store.getAll();
    return getNested(root, key);
  });
  handle(IPC_INVOKE.STORE_SET_ALL, (_, config) => {
    settings.store.setAll(config);

    event.send("setting-updated");
  });
  handle(IPC_INVOKE.STORE_SET, (_, key: string, value?: any) => {
    const root = settings.store.getAll();
    setNested(root, key, value);

    event.send("setting-updated");
    if (key === "settings.design.theme") event.send("theme-updated", value);
  });
}