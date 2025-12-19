// const ITEMS_TOP = [
//   {
//     type: "item",
//     id: "new-tab",
//     title: "新しいタブ",
//     command: "newtab",
//     accelerators: "Ctrl+T"
//   },
//   {
//     type: "separator"
//   },
//   {
//     type: "category",
//     id: "bookmarks",
//     title: "ブックマーク",
//     command: "bookmarks"
//   },
//   {
//     type: "category",
//     id: "histories",
//     title: "履歴",
//     command: "histories"
//   },
//   {
//     type: "item",
//     id: "downloads",
//     title: "ダウンロード",
//     command: "downloads",
//     accelerators: "Ctrl+J"
//   },
//   {
//     type: "separator"
//   },
//   {
//     type: "item",
//     id: "settings",
//     title: "設定",
//     command: "settings"
//   },
//   {
//     type: "item",
//     id: "quit",
//     title: "終了",
//     command: "quit"
//   },
// ];

// const ITEMS_BOOKMARKS = [
//   {
//     type: "item",
//     id: "new-bookmark",
//     title: "新しいブックマークを追加",
//     command: "",
//     accelerators: "Ctrl+D"
//   },
//   {
//     type: "separator"
//   },
//   {
//     type: "item",
//     id: "show-all-bookmarks",
//     title: "ブックマークをすべて表示",
//     command: "",
//     accelerators: "Ctrl+Shift+O"
//   },
//   {
//     type: "separator"
//   },
//   // ブックマークのアイテム
// ];

const ITEMS_HISTORY = [
  {
    type: "item",
    id: "show-all-histories",
    title: "履歴をすべて表示",
    command: "show-all-histories",
    accelerators: "Ctrl+H"
  },
  {
    type: "item",
    id: "remove-all-histories",
    title: "すべての閲覧履歴を削除",
    command: "remove-all-histories"
  },
  {
    type: "separator"
  },
];

function getAllMenuItems() {
  let items = [];
  if (typeof itemBookmarks !== "undefined") items.push(...itemBookmarks);
  if (typeof ITEMS_HISTORY !== "undefined") items.push(...ITEMS_HISTORY);
  if (typeof ITEMS_TOP !== "undefined") items.push(...ITEMS_TOP);
  return items;
}

const COMMANDS = {
  "go-prev": () => {
    document.querySelectorAll("main>div#top>a").forEach(element => element.removeAttribute("tabindex"));
    document.querySelector("#children-menu").classList.remove("visible");
    document.querySelector("#children-menu>a[data-command=\"go-prev\"]").setAttribute("tabindex", "-1");
    document.querySelector("#children-menu>iframe").src = "";
    document.querySelector("main>div#top>a").focus();
  },
  "new-tab": () => {
    flune.newTab();
    closeMenu();
  },
  bookmarks: () => {
    document.querySelectorAll("main>div#top>a").forEach(element => element.setAttribute("tabindex", "-1"));
    document.querySelector("#children-menu>iframe").src = "./bookmarks.html";
    document.querySelector("#children-menu>iframe").contentWindow.postMessage(
      { type: "focus" },
      "*"
    );
    document.querySelector("#children-menu").classList.add("visible");
    document.querySelector("#children-menu>a[data-command=\"go-prev\"]").removeAttribute("tabindex");
  },
  histories: () => {
    document.querySelectorAll("main>div#top>a").forEach(element => element.setAttribute("tabindex", "-1"));
    document.querySelector("#children-menu>iframe").src = "./histories.html";
    document.querySelector("#children-menu>iframe").contentWindow.postMessage(
      { type: "focus" },
      "*"
    );
    document.querySelector("#children-menu").classList.add("visible");
    document.querySelector("#children-menu>a[data-command=\"go-prev\"]").removeAttribute("tabindex");
  },
  "add-bookmark": () => {
    flune.bookmark.add();
    closeMenu();
  },
  "open-bookmark": (item) => {
    flune.load(undefined, item.payload.url);
  },
  "show-all-bookmarks": () => {
    flune.showAllBookmarks();
    closeMenu();
  },
  "downloads": () => {
    flune.openDownloads();
    closeMenu();
  },
  "versions": () => {
    flune.showVersionsPage();
    closeMenu();
  },
  "settings": () => {
    flune.openSettings();
    closeMenu();
  },
  "quit": () => {
    flune.quit();
    closeMenu();
  },
};

let computerInfo = {};

window.addEventListener("DOMContentLoaded", async () => {
  if (window.flune) computerInfo = await flune.getComputerInfo();
  else computerInfo = {
    arch: "x64",
    platform: "win32"
  }

  setClickEvent();
});

function setClickEvent() {
  let menuLists = document.querySelectorAll("main>div");
  menuLists.forEach((menuList) => {
    menuList.onclick = (e) => {
      const target = e.target.closest("[data-command]");
      if (!target) return;

      e.preventDefault();
      
      const command = target.dataset.command;
      const item = target.dataset.id;
      runCommand(command, item);
    }
  });
}

function toKeyCode(accelerators = "") {
  let keys = accelerators.split("\+").map((acc, index) => {
    switch (acc) {
      case "Command":
      case "Cmd":
        return computerInfo.platform === "darwin" ? "Meta" : "";

      case "Control":
      case "Ctrl":
        return "Control";

      case "CommandOrControl":
      case "CmdOrCtrl":
        return computerInfo.platform === "darwin" ? "Meta" : "Control";

      case "Alt":
      case "Option":
        return "Alt";

      case "Shift":
        return "Shift";

      case "Shift":
        return "Shift";

      case "Up":
        return "ArrowUp";

      case "Down":
        return "ArrowDown";

      case "Left":
        return "ArrowLeft";

      case "Right":
        return "ArrowRight";

      case "Escape":
      case "Esc":
        return "Escape";

      case "Delete":
        return computerInfo.platform === "darwin" ? "Backspace" : "Delete";

      default:
        if (acc.match(/^[a-zA-Z]$/)) return `Key${acc.toUpperCase()}`;
        else if (acc.match(/^[0-9]$/)) return `Digit${acc}`;
        else if (acc.match(/^num[0-9]$/)) return `Numpad${acc.slice(3)}`;
        else return acc;
    }
  });

  return keys;
}

function normalizeAccelerator(parsed) {
  return {
    ctrl: parsed.includes("Control"),
    meta: parsed.includes("Meta"),
    shift: parsed.includes("Shift"),
    alt: parsed.includes("Alt"),
    code: parsed.find(k => k.startsWith("Key") || k.startsWith("Digit") || k.startsWith("Numpad")),
  };
}

function serialize(acc) {
  return [
    acc.ctrl && "Ctrl",
    acc.meta && "Meta",
    acc.shift && "Shift",
    acc.alt && "Alt",
    acc.code,
  ].filter(Boolean).join("+");
}

function eventToKey(e) {
  return [
    e.ctrlKey && "Ctrl",
    e.metaKey && "Meta",
    e.shiftKey && "Shift",
    e.altKey && "Alt",
    e.code,
  ].filter(Boolean).join("+");
}

function runCommand(command, context) {
  COMMANDS[command]?.(context);
}

function renderMenu(items) {
  return items.map((item) => {
    switch (item.type) {
      case "item":
      case "category":
      case "bookmark":
      case "bookmarkFolder":
        return `
        <a
          href="#"
          role="menuitem"
          data-command="${item.command}"
          aria-disabled="${Boolean(item.disabled)}"
          title="${item.title}"
          class="menu-item ${item.disabled ? "disabled" : ""}"
        >
          <span class="title">${item.title}</span>
          ${item.accelerators
          ? `<span class="accel">
                ${item.accelerators.split("+").map((acc) => `<kbd>${acc}</kbd>`).join("+")}
              </span>`
          : ""
        }
          ${item.type === "category" || item.type === "bookmarkFolder" ? "<i data-lucide=\"chevron-right\"></i>" : ""
        }
        </a>
        `;
      case "separator":
        return "<hr />";
    }
  }).join("");
}