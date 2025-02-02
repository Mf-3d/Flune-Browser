window.addEventListener("load", () => {
  each();
  const tabContainer = document.getElementById("tabs");

  flune.on("tab.new", (event, tab) => {
    const newButton = tabContainer.querySelector(".new-button");

    const element = document.createElement("span");
    element.draggable = true;
    element.setAttribute("data-id", tab.id);
    element.innerHTML = `
    <img src="" class="favicon"/>
    <a class="loading disabled">
      <i data-lucide="loader-circle"></i>
    </a>
    <p class="title">${tab.title}</p>
    <span class="right">
      <a class="downloading disabled">
        <i data-lucide="download"></i>
      </a>
      <a class="audible disabled">
        <i data-lucide="volume-2"></i>
      </a>
    </span>
    <a class="close-button right" href="javascript:flune.removeTab('${tab.id}')">
      <i data-lucide="x"></i>
    </a>
    `;

    newButton.before(element); // 一番右に追加

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
});

function each () {
  const tabContainer = document.getElementById("tabs");

  tabContainer.querySelectorAll(":scope > span").forEach((element) => {
    // 移動関連のイベントは置き換えられる
    element.removeEventListener("click", arguments.callee);
    element.removeEventListener("dragend", arguments.callee);

    element.addEventListener("click", () => {
      // if (!canMove) return;
      flune.switchTab(element.getAttribute("data-id"));
    });

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