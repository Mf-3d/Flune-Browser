import lucide from "../script/icons.js";
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

/**
 * @deprecated
 */
function each() {
  const tabContainer = document.getElementById("tabs")!;

  tabContainer.querySelectorAll(":scope > span").forEach((e) => {
    const element = e as HTMLElement
    const title = element.querySelector(":scope > .title") as HTMLElement;

    // タブを切り替える
    title.onclick = () => {
      if (!window.flune.navigation) return;

      window.flune.navigation.tab.activate(element.getAttribute("data-id")!);
    };
    // タブ用のコンテキストメニューを表示する
    title.oncontextmenu = (event) => {
      event.preventDefault();

      // window.flune.toggleTabContextMenu(element.getAttribute("data-id")!);
    };
  });
}