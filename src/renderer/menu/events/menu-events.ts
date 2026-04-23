import { renderMenu } from "../ui/render";
import { registerClickEvents } from "../ui/click-events";

export function registerMenuEvents() {
  if (!window.flune.menu) return;

  window.flune.menu.onOpening(onOpening);
  window.flune.menu.onClosing(onClosing);
}

function onOpening() {
  renderMenu("root");
  registerClickEvents();

  document.querySelector("main")?.classList.remove("hidden");
}

function onClosing() {
  document.querySelector("main")?.classList.add("hidden");
}
