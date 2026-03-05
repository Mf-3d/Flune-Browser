import { ipcMain } from "electron";
import { SettingsStore } from "@/main/settings/settings-store";
import Event from "@/main/lib/event";
import { validateSender } from "@/main/ipc/validateSender";
import { IPC_INVOKE } from "@/shared/ipc/channels";

function getNested(obj: any, path: string) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

function setNested(obj: any, path: string, value: unknown) {
  const keys = path.split(".");
  const last = keys.pop()!;
  const target = keys.reduce((acc, key) => acc[key], obj);
  target[last] = value;
}

export function registerSettingsHandler(store: SettingsStore, event: Event) {
  ipcMain.handle(IPC_INVOKE.STORE_GET_ALL, (e) => {
    if (!e.senderFrame) return null;
    if(!validateSender(e.senderFrame)) return null;

    return store.getAll();
  });
  ipcMain.handle(IPC_INVOKE.STORE_GET, (e, key: string) => {
    if (!e.senderFrame) return null;
    if(!validateSender(e.senderFrame)) return null;

    const root = store.getAll();
    return getNested(root, key);
  });
  ipcMain.handle(IPC_INVOKE.STORE_SET_ALL, (e, config) => {
    if (!e.senderFrame) return null;
    if(!validateSender(e.senderFrame)) return null;

    store.setAll(config);

    event.send("setting-updated");
  });
  ipcMain.handle(IPC_INVOKE.STORE_SET, (e, key: string, value?: any) => {
    if (!e.senderFrame) return null;
    if(!validateSender(e.senderFrame)) return null;
    
    const root = store.getAll();
    setNested(root, key, value);

    event.send("setting-updated");
    if (key === "settings.design.theme") event.send("theme-updated", value);
  });
}