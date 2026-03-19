import type { OptionMenuItem } from "@/shared/types/menu";
import type { IpcRendererEvent } from "electron";
import { renderMenu } from "../ui/render";

export function registerMenuEvents() {
  if (!window.flune.menu) return;

  window.flune.menu.onOpening(onOpening);
  window.flune.menu.onClosing(onClosing);
}

function onOpening(_: IpcRendererEvent, template: OptionMenuItem[]) {
  const menuElement = document.querySelector("main>div")!;
  menuElement.innerHTML = renderMenu(template);

  document.querySelector("main")?.classList.remove("hidden");
}

function onClosing(_: IpcRendererEvent) {
  document.querySelector("main")?.classList.add("hidden");
}