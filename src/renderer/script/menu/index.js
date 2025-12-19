const ITEMS_TOP = [
  {
    type: "item",
    id: "newtab",
    title: "新しいタブ",
    command: "new-tab",
    accelerators: "Ctrl+T"
  },
  {
    type: "separator"
  },
  {
    type: "category",
    id: "bookmarks",
    title: "ブックマーク",
    command: "bookmarks"
  },
  {
    type: "category",
    id: "histories",
    title: "履歴",
    command: "histories"
  },
  {
    type: "item",
    id: "downloads",
    title: "ダウンロード",
    command: "downloads",
    accelerators: "Ctrl+J"
  },
  {
    type: "separator"
  },
  {
    type: "item",
    id: "versions",
    title: "バージョン情報",
    command: "versions"
  },
  {
    type: "item",
    id: "settings",
    title: "設定",
    command: "settings"
  },
  {
    type: "item",
    id: "quit",
    title: "終了",
    command: "quit"
  },
];

const SHORTCUT_TOP = new Map();

window.addEventListener("DOMContentLoaded", async () => {
  buildMenuItems();

  // ショートカットキーのマップを作成する。
  for (const item of ITEMS_TOP) {
    if (!item.accelerators) continue;

    const acc = normalizeAccelerator(toKeyCode(item.accelerators));
    const key = serialize(acc);

    SHORTCUT_TOP.set(key, item.command);
  }

  // メニューの外をクリックしたらメニューを閉じる。
  document.querySelector("#toggle").addEventListener("click", () => {
    closeMenu();
  });
});

function buildMenuItems() {
  let topMenu = document.querySelector("main>div#top");
  topMenu.innerHTML = renderMenu(ITEMS_TOP);
  lucide.createIcons();
}

// 開くアニメーション。
window.addEventListener("load", () => {
  document.querySelector("main>div#top").classList.remove("hidden");
});

// メニューのクリックイベントを設定。
window.addEventListener("keydown", (e) => {
  if (document.querySelector("#children-menu").classList.contains("visible")) return;
  // IME変換中は無視
  if (e.isComposing) return;

  const key = eventToKey(e);
  const command = SHORTCUT_TOP.get(key);

  if (!command) return;

  e.preventDefault();
  runCommand(command);
});

window.addEventListener("message", async (e) => {
  switch (e.data.type) {
    case "focus":
      document.querySelector("main>div a").focus();
      break;
    case "close":
      document.querySelector("main").classList.add("hidden");
      document.querySelector("#children-menu").classList.remove("visible");
      break;
    case "open":
      document.querySelector("main").classList.remove("hidden");
      document.querySelector("#children-menu").classList.remove("visible");
      break;
    case "menu.bookmark.update-by-folder-id":
      let bookmarks = await flune.bookmark.getByFolderId(e.data.folderId);
      document.querySelector("#children-menu>iframe").contentWindow.postMessage(
        { type: "menu.update-bookmarks", folderId: e.data.folderId, bookmarks },
        "*"
      );
      break;
  }
});

function closeMenu() {
  document.querySelector("main").classList.add("hidden");
  document.querySelector("#children-menu").classList.remove("visible");
  flune.closeMenu();
}

flune.on("menu.close", () => {
  document.querySelector("main").classList.add("hidden");
  document.querySelector("#children-menu").classList.remove("visible");
});

flune.on("menu.update-bookmarks", (event, folderId, bookmarks) => {
  document.querySelector("#children-menu>iframe").contentWindow.postMessage(
    { type: "menu.update-bookmarks", folderId, bookmarks },
    "*"
  );
});