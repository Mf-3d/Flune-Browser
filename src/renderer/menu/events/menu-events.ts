import { renderMenu } from "../ui/render";

export function registerMenuEvents() {
  if (!window.flune.menu) return;

  window.flune.menu.onOpening(onOpening);
  window.flune.menu.onClosing(onClosing);
}

function onOpening() {
  renderMenu("root");

  document.querySelector("main")?.classList.remove("hidden");
}

function onClosing() {
  document.querySelector("main")?.classList.add("hidden");
}
