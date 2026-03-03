import { registerInputEvents } from "./navigation/input.js";

registerInputEvents();

window.addEventListener("load", () => {
  each();

  const tabContainer = document.getElementById("tabs");
  const input = document.getElementById("search-bar");

  flune.on("flune.toggle-home-button", (event, visiblity) => {
    const homeButton = document.getElementById("go-home");

    visiblity ? homeButton.classList.remove("invisible") : homeButton.classList.add("invisible");
  });

  flune.onStateUpdated((event, id, state) => {
    switch (id) {
      case "can-go-back":
        if (state) document.querySelector(".go-back").classList.remove("disabled");
        else document.querySelector(".go-back").classList.add("disabled");
        break;
      case "can-go-forward":
        if (state) document.querySelector(".go-forward").classList.remove("disabled");
        else document.querySelector(".go-forward").classList.add("disabled");
        break;
      case "is-bookmarked":
        if (state) document.querySelector("#bookmark").classList.add("active");
        else document.querySelector("#bookmark").classList.remove("active");
        break;
    }
  });

  flune.on("tab.new", (event, tab) => {
    const newButton = tabContainer.querySelector(".new-button");

    const element = document.createElement("span");
    element.draggable = true;
    element.setAttribute("data-id", tab.id);
    element.innerHTML = `
    <img src="" class="favicon" onerror="this.src='flune://assets/image/tab-no-favicon.png';"/>
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
      tabContainer.querySelector(`:scope > span[data-id="${tab.beforeTabId}"]`).after(element);
    }

    lucide.createIcons();
    each();
  });

  flune.on("tab.activate", (event, id) => {
    const tabElements = tabContainer.querySelectorAll(":scope > span");
    tabElements.forEach(tab => {
      tab.getAttribute("data-id") === id ? tab.id = "opened" : tab.id = "";
    });
  });

  flune.on("tab.remove", (event, id) => {
    const tabElements = tabContainer.querySelectorAll(":scope > span");
    tabElements.forEach(tab => {
      if (tab.getAttribute("data-id") === id) tab.remove();
    });
  });

  flune.on("tab.change-state", (event, id, state, value) => {
    const tabElements = tabContainer.querySelectorAll(":scope > span");
    tabElements.forEach(tab => {
      if (tab.getAttribute("data-id") === id) {
        switch (state) {
          case "title":
            console.info("(change-state) title:", value);
            tab.querySelector("p.title").innerText = value;
            break;
          case "favicon":
            console.info("(change-state) favicon:", value);
            tab.querySelector("img.favicon").src = value;
            break;
          case "loading":
            console.info("(change-state) loading:", value);
            if (value) tab.querySelector("a.loading").classList.remove("disabled");
            else tab.querySelector("a.loading").classList.add("disabled");
            break;
          case "audible":
            console.info("(change-state) audible:", value);
            if (value) tab.querySelector("a.audible").classList.remove("disabled");
            else tab.querySelector("a.audible").classList.add("disabled");
            break;
        }
      }
    });
  });
});

function toggleBookmark() {
  flune.toggleBookmark();
  document.getElementById("bookmark").classList.toggle("active");
}

function updateSymbolColor() {
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
  flune.updateSymbolColor(textColor);
}

function removeTab(id) {
  flune.removeTab(id);
  console.info("(removeTab):", id);
}

window.toggleBookmark = toggleBookmark;
window.updateSymbolColor = updateSymbolColor;
window.removeTab = removeTab;

function each() {
  const tabContainer = document.getElementById("tabs");

  tabContainer.querySelectorAll(":scope > span").forEach((element) => {
    // タブを切り替える
    element.querySelector(":scope > .title").onclick = () => {
      flune.switchTab(element.getAttribute("data-id"));
    };
    // タブ用のコンテキストメニューを表示する
    element.querySelector(":scope > .title").oncontextmenu = (event) => {
      event.preventDefault();

      flune.toggleTabContextMenu(element.getAttribute("data-id"));
    };

    // タブ移動
    element.ondragstart = function (event) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", event.target.getAttribute("data-id"));
    }
    element.ondragover = function (event) {
      event.preventDefault();
      let rect = this.getBoundingClientRect();
      if ((event.clientX - rect.left) < (this.clientWidth / 2)) {
        //マウスカーソルの位置が要素の半分より左
        this.classList.add("adding-left");
        this.classList.remove("adding-right");
      } else {
        //マウスカーソルの位置が要素の半分より右
        this.classList.remove("adding-left");
        this.classList.add("adding-right");
      }
    }
    element.ondragleave = function () {
      this.classList.remove("adding-left");
      this.classList.remove("adding-right");
    }
    element.ondrop = function (event) {
      event.preventDefault();
      let id = event.dataTransfer.getData("text/plain");
      let tabInDrag = tabContainer.querySelector(`:scope > span[data-id="${id}"]`);

      let rect = this.getBoundingClientRect();
      if ((event.clientX - rect.left) < (this.clientWidth / 2)) {
        //マウスカーソルの位置が要素の半分より左
        element.insertAdjacentElement('beforebegin', tabInDrag);
      } else {
        //マウスカーソルの位置が要素の半分より右
        element.insertAdjacentElement('afterend', tabInDrag);
      }

      tabContainer.querySelectorAll(":scope > span").forEach((el) => {
        el.classList.remove("adding-left");
        el.classList.remove("adding-right");
      });

      event.dataTransfer.clearData('text/plain');
      each();
    }
    element.ondragend = function () {
      this.classList.remove("adding-left");
      this.classList.remove("adding-right");
    }
  });
}