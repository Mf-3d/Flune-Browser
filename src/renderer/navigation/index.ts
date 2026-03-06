import lucide from "../script/icons.js";
import { registerInputEvents } from "./ui/input-events";
import { registerClickEvents } from "./ui/click-events";
import { registerNavigationEvents } from "./events/navigation-events";
import { registerTabEvents } from "./events/tab-events";


window.addEventListener("load", () => {
  navigationInit();
});

function navigationInit() {
  lucide.createIcons();

  registerClickEvents();
  registerInputEvents();
  registerNavigationEvents();
  registerTabEvents();

  each(); // 状態更新
}

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

    // タブ移動
    element.ondragstart = function (event: DragEvent) {
      event.dataTransfer!.effectAllowed = "move";
      const target = event.target as HTMLElement;
      event.dataTransfer!.setData("text/plain", target.getAttribute("data-id")!);
    }
    element.ondragover = function (event) {
      event.preventDefault();

      const el = element;
      let rect = element.getBoundingClientRect();
      if ((event.clientX - rect.left) < (el.clientWidth / 2)) {
        //マウスカーソルの位置が要素の半分より左
        el.classList.add("adding-left");
        el.classList.remove("adding-right");
      } else {
        //マウスカーソルの位置が要素の半分より右
        el.classList.remove("adding-left");
        el.classList.add("adding-right");
      }
    }
    element.ondragleave = function () {
      const el = element;

      el.classList.remove("adding-left");
      el.classList.remove("adding-right");
    }
    element.ondrop = function (event) {
      event.preventDefault();

      const el = element;
      let id = event.dataTransfer!.getData("text/plain");
      let tabInDrag = tabContainer.querySelector(`:scope > span[data-id="${id}"]`)!;

      let rect = el.getBoundingClientRect();
      if ((event.clientX - rect.left) < (el.clientWidth / 2)) {
        //マウスカーソルの位置が要素の半分より左
        element.insertAdjacentElement("beforebegin", tabInDrag);
      } else {
        //マウスカーソルの位置が要素の半分より右
        element.insertAdjacentElement("afterend", tabInDrag);
      }

      tabContainer.querySelectorAll(":scope > span").forEach((el) => {
        el.classList.remove("adding-left");
        el.classList.remove("adding-right");
      });

      event.dataTransfer!.clearData("text/plain");
      each();
    }
    element.ondragend = function () {
      const el = element;

      el.classList.remove("adding-left");
      el.classList.remove("adding-right");
    }
  });
}