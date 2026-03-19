import { registerMenuEvents } from "./events/menu-events";
import { registerClickEvents } from "./ui/click-events";

window.addEventListener("DOMContentLoaded", onInit);

function onInit() {
  registerMenuEvents();
  registerClickEvents();
}