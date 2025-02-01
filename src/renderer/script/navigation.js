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

    newButton.before(element);

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
  document.querySelectorAll("#tabs > span").forEach((element, i) => {
    element.removeEventListener("click", arguments.callee);
    element.removeEventListener("dragend", arguments.callee);

    element.addEventListener("click", () => {
      // if (!canMove) return;
      flune.switchTab(element.getAttribute("data-id"));
    });
    element.addEventListener("dragend", (e) => {});
  });
}