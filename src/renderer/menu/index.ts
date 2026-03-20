import { registerMenuEvents } from "./events/menu-events";
import { menuIpc } from "./ipc/menu-ipc";
import { registerClickEvents } from "./ui/click-events";

window.addEventListener("DOMContentLoaded", onInit);
window.addEventListener("blur", onBlur);

function onInit() {
  registerMenuEvents();
  registerClickEvents();
}

function onBlur() {
  menuIpc.close();
}
