import { registerInputEvents } from "./ui/input-events";
import lucide from "../script/icons.js";
import { registerClickEvents } from "./ui/click-events";
import { registerNavigationEvents } from "./events/navigation-events";
import { registerTabEvents } from "./events/tab-events";


window.addEventListener("load", () => {
  if (!window.flune.navigation) return;

  lucide.createIcons();

  registerClickEvents();
  registerInputEvents();
  registerNavigationEvents();
  registerTabEvents();

  // window.flune.navigation.tab.onCreated((_, tab) => {
  //   const newButton = tabContainer.querySelector(".new-button")!;

  //   const element = document.createElement("span");
  //   element.draggable = true;
    
  //   element.setAttribute("data-id", tab.id);

  //   element.innerHTML = `
  //   <img src="" class="favicon" onerror="this.src='/image/tab-no-favicon.png';"/>
  //   <a href="#" class="loading disabled">
  //     <i data-lucide="loader-circle"></i>
  //   </a>
  //   <p class="title">${tab.title}</p>
  //   <span class="right">
  //     <a href="#" class="downloading disabled">
  //       <i data-lucide="download"></i>
  //     </a>
  //     <a href="#" class="audible disabled">
  //       <i data-lucide="volume-2"></i>
  //     </a>
  //   </span>
  //   <a href="javascript:window.flune.navigation?.tab.remove('${tab.id}')" class="close-button right">
  //     <i data-lucide="x"></i>
  //   </a>
  //   `;

  //   if (!tab.beforeTabId) {
  //     newButton.before(element); // 一番右に追加
  //   } else {
  //     tabContainer.querySelector(`:scope > span[data-id="${tab.beforeTabId}"]`)?.after(element);
  //   }
    
  //   if (tab.active) activateTab(tab.id);

  //   lucide.createIcons();

  //   each();
  // });

  // window.flune.navigation.tab.onRemoved((_, id) => {
  //   const tabElements = tabContainer.querySelectorAll(":scope > span");

  //   tabElements.forEach(tabElement => {
  //     if (tabElement.getAttribute("data-id") === id) tabElement.remove();
  //   });

  //   each();
  // });

  // window.flune.navigation.tab.onUpdated((_, tab) => {
  //   const tabElements = tabContainer.querySelectorAll(":scope > span");

  //   tabElements.forEach((tabElement) => {
  //     if (tabElement.getAttribute("data-id") !== tab.id) return;

  //     if (tab.title !== undefined) {
  //       console.info("(change-state) title:", tab.title);
  //       const titleElement = tabElement.querySelector("p.title")! as HTMLElement;
  //       titleElement.innerText = tab.title;
  //     }

  //     if (tab.favicon !== undefined) {
  //       console.info("(change-state) favicon:", tab.favicon);
  //       const faviconElement = tabElement.querySelector("img.favicon")! as HTMLElement;
  //       faviconElement.setAttribute("src", tab.favicon);
  //     }

  //     if (tab.isLoading !== undefined) {
  //       console.info("(change-state) loading:", tab.isLoading);
  //       const loadingElement = tabElement.querySelector("a.loading")! as HTMLElement;

  //       if (tab.isLoading) loadingElement.classList.remove("disabled");
  //       else loadingElement.classList.add("disabled");
  //     }

  //     if (tab.isAudible !== undefined) {
  //       console.info("(change-state) audible:", tab.isAudible);
  //       const audibleElement = tabElement.querySelector("a.audible")! as HTMLElement;

  //       if (tab.isAudible) audibleElement.classList.remove("disabled");
  //       else audibleElement.classList.add("disabled");
  //     }
  //   });

  //   if (tab.active !== undefined) {
  //     activateTab(tab.id);
  //   }
  // });

  each();
});



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