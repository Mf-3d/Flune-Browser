import lucide from "../utils/icons";
import { registerInputEvents } from "./ui/input-events";
import { registerClickEvents } from "./ui/click-events";
import { registerNavigationEvents } from "./events/navigation-events";
import { registerTabEvents } from "./events/tab-events";
import { registerTabDragEvents } from "./ui/tab-drag-events.js";


window.addEventListener("DOMContentLoaded", navigationInit);

function navigationInit() {
  registerClickEvents();
  registerInputEvents();
  registerNavigationEvents();
  registerTabEvents();
  registerTabDragEvents();

  updateTabsUI();
}

export function updateTabsUI() {
  lucide.createIcons();
}