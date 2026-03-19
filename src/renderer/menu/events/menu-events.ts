import { renderMenu } from "../ui/render";

import type { IpcRendererEvent } from "electron";


export function registerMenuEvents() {
  if (!window.flune.menu) return;

  window.flune.menu.onOpening(onOpening);
  window.flune.menu.onClosing(onClosing);
}

function onOpening(_: IpcRendererEvent) {
  renderMenu("root");

  document.querySelector("main")?.classList.remove("hidden");
}

function onClosing(_: IpcRendererEvent) {
  document.querySelector("main")?.classList.add("hidden");
}