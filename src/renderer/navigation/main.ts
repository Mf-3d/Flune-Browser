import { registerInputEvents } from "./input";
import lucide from "../script/icons.js";
import { applyTheme } from "./theme";


window.addEventListener("load", () => {
  registerInputEvents();
  each();

  const tabContainer = document.getElementById("tabs")!;
  const input = document.getElementById("search-bar");

  window.flune.on("flune.toggle-home-button", (event, visiblity) => {
    const homeButton = document.getElementById("go-home")!;

    visiblity ? homeButton.classList.remove("invisible") : homeButton.classList.add("invisible");
  });

  window.flune.onStateUpdated((_, state) => {
    if(state.isBookmarked !== undefined) {
      const bookmarkElement = document.querySelector("#bookmark")!;

      if (state.isBookmarked) {
        bookmarkElement.classList.add("active");
      } else {
        bookmarkElement.classList.remove("active");
      }
    }

    if(state.canGoBack !== undefined) {
      const goBackElement = document.querySelector(".go-back")!;

      if (state.canGoBack) {
        goBackElement.classList.remove("disabled");
      } else {
        goBackElement.classList.add("disabled");
      }
    }

    if(state.canGoForward !== undefined) {
      const goForwardElement = document.querySelector(".go-forward")!;

      if (state.canGoForward) {
        goForwardElement.classList.remove("disabled");
      } else {
        goForwardElement.classList.add("disabled");
      }
    }
  });

  window.flune.onThemeChanged((_, themeUrl) => {
    applyTheme(themeUrl);
  });

  window.flune.on("tab.new", (event, tab) => {
    const newButton = tabContainer.querySelector(".new-button")!;

    const element = document.createElement("span");
    element.draggable = true;
    element.setAttribute("data-id", tab.id);
    element.innerHTML = `
    <img src="" class="favicon" onerror="this.src='/image/tab-no-favicon.png';"/>
    <a href="#" class="loading disabled">
      <i data-lucide="loader-circle"></i>
    </a>
    <p class="title">${tab.title}</p>
    <span class="right">
      <a href="#" class="downloading disabled">
        <i data-lucide="download"></i>
      </a>
      <a href="#" class="audible disabled">
        <i data-lucide="volume-2"></i>
      </a>
    </span>
    <a href="javascript:removeTab('${tab.id}')" class="close-button right">
      <i data-lucide="x"></i>
    </a>
    `;

    if (!tab.beforeTabId) {
      newButton.before(element); // 一番右に追加
    } else {
      tabContainer.querySelector(`:scope > span[data-id="${tab.beforeTabId}"]`)?.after(element);
    }

    lucide.createIcons();
    each();
  });

  window.flune.on("tab.activate", (event, id) => {
    const tabElements = tabContainer.querySelectorAll(":scope > span");
    tabElements.forEach(tab => {
      tab.getAttribute("data-id") === id ? tab.id = "opened" : tab.id = "";
    });
  });

  window.flune.on("tab.remove", (event, id) => {
    const tabElements = tabContainer.querySelectorAll(":scope > span");
    tabElements.forEach(tab => {
      if (tab.getAttribute("data-id") === id) tab.remove();
    });
  });

  window.flune.on("tab.change-state", (event, id, state, value) => {
    const tabElements = tabContainer.querySelectorAll(":scope > span");
    tabElements.forEach(t => {
      const tab = t as HTMLElement;

      if (tab.getAttribute("data-id") === id) {
        switch (state) {
          case "title":
            console.info("(change-state) title:", value);
            const title = tab.querySelector("p.title")! as HTMLElement;
            title.innerText = value;
            break;
          case "favicon":
            console.info("(change-state) favicon:", value);
            const favicon = tab.querySelector("img.favicon")! as HTMLElement;
            favicon.setAttribute("src", value);
            break;
          case "loading":
            console.info("(change-state) loading:", value);
            if (value) tab.querySelector("a.loading")!.classList.remove("disabled");
            else tab.querySelector("a.loading")!.classList.add("disabled");
            break;
          case "audible":
            console.info("(change-state) audible:", value);
            if (value) tab.querySelector("a.audible")!.classList.remove("disabled");
            else tab.querySelector("a.audible")!.classList.add("disabled");
            break;
        }
      }
    });
  });
});

function toggleBookmark() {
  window.flune.toggleBookmark();
  document.getElementById("bookmark")?.classList.toggle("active");
}

function updateSymbolColor() {
  const textColor = getComputedStyle(document.documentElement).getPropertyValue("--text-color");
  window.flune.updateSymbolColor(textColor);
}

function removeTab(id: string) {
  window.flune.removeTab(id);
  console.info("(removeTab):", id);
}

window.toggleBookmark = toggleBookmark;
window.updateSymbolColor = updateSymbolColor;
window.removeTab = removeTab;

function each() {
  const tabContainer = document.getElementById("tabs")!;

  tabContainer.querySelectorAll(":scope > span").forEach((e) => {
    const element = e as HTMLElement
    const title = element.querySelector(":scope > .title") as HTMLElement;

    // タブを切り替える
    title.onclick = () => {
      window.flune.switchTab(element.getAttribute("data-id")!);
    };
    // タブ用のコンテキストメニューを表示する
    title.oncontextmenu = (event) => {
      event.preventDefault();

      window.flune.toggleTabContextMenu(element.getAttribute("data-id")!);
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