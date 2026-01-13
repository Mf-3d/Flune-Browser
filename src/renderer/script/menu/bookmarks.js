let itemBookmarks = [
  {
    type: "item",
    id: "add-bookmark",
    title: "新しいブックマークを追加",
    command: "add-bookmark",
    accelerators: "Ctrl+D"
  },
  {
    type: "separator"
  },
  {
    type: "item",
    id: "show-all-bookmarks",
    title: "ブックマークをすべて表示",
    command: "show-all-bookmarks",
    accelerators: "Ctrl+Shift+O"
  },
  {
    type: "separator"
  },
  // ブックマークのアイテム
];

const SHORTCUT_BOOKMARKS = new Map();

window.addEventListener("keydown", (e) => {
  // IME変換中は無視
  if (e.isComposing || e.repeat) return;

  const key = eventToKey(e);
  const command = SHORTCUT_BOOKMARKS.get(key);

  if (!command) return;

  e.preventDefault();
  runCommand(command);
});

window.addEventListener("message", (e) => {
  switch (e.data.type) {
    case "focus":
      document.querySelector("main>div a").focus();
      break;
    case "menu.update-bookmarks":
      updateBookmarkItems(e.data.folderId, e.data.bookmarks);
      break;
  }
});

window.addEventListener("DOMContentLoaded", async () => {
  buildMenuItems();
  document.querySelector("main>div a").focus();

  for (const item of itemBookmarks) {
    if (!item.accelerators) continue;

    const acc = normalizeAccelerator(toKeyCode(item.accelerators));
    const key = serialize(acc);

    SHORTCUT_BOOKMARKS.set(key, item.command);
  }

  window.parent.postMessage({ type: "menu.bookmark.update-by-folder-id", folderId: "root" }, "*");
});

function buildMenuItems() {
  let bookmarkMenu = document.querySelector("main>div#bookmarks");
  bookmarkMenu.innerHTML = renderMenu(itemBookmarks);
  lucide.createIcons();
}

function updateBookmarkItems(folderId, bookmarks) {
  itemBookmarks = itemBookmarks.filter((item) => (item.type !== "bookmark" || item.type !== "bookmarkFolder"));

  if (folderId === "root") {
    bookmarks.forEach((bookmark) => {
      let menuItem = {};

      if (bookmark.type === "bookmark") {
        menuItem = {
          id: `bookmark-"${bookmark.folder}">"${bookmark.id}"`,
          type: "bookmark",
          title: bookmark.title,
          command: "open-bookmark",
          payload: {
            url: bookmark.url
          }
        };
      } else {
        menuItem = {
          id: `bookmarkFolder-"${bookmark.id}"`,
          type: "bookmark-folder",
          title: bookmark.title,
          command: "open-bookmark-folder",
        };
      }

      
      itemBookmarks.push(menuItem);
    });
  }

  buildMenuItems();
}

function closeMenu() {
  window.parent.postMessage({ type: "close" }, "*");
  flune.closeMenu();
}