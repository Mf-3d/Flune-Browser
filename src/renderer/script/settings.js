/** 保存されているか。 */
let isSaved = true;

window.addEventListener("DOMContentLoaded", () => {
  each();
});

async function each() {
  // --エンジンのオプションを追加
  const selectEngines = document.querySelector("#search-engine");

  selectEngines.childNodes.forEach(option => selectEngines.remove(option.value));

  /** 検索エンジンの一覧。 */
  const engines = (await fluneSettings.store.get("searchEngines"))
  .map((engine) => ({
    id: engine.id,
    name: engine.name
  }));

  engines.forEach((engine) => {
    let option = document.createElement("option");
    option.value = engine.id;
    option.innerHTML = engine.name;

    selectEngines.appendChild(option);
  });

  let inputElements = document.querySelectorAll(".content input, .content select");

  // --設定フォームの状態を更新
  inputElements.forEach(async (element) => {
    const id = element.id;

    switch (id) {
      case "setting-auto-save":
        element.checked = await fluneSettings.store.get("settings.autoSave");
        break;
      case "toggle-home-button":
        element.checked = await fluneSettings.store.get("settings.design.showHomeButton");
        break;
      case "search-engine":
        element.value = await fluneSettings.store.get("settings.search.engine");
        break;
    }
  });
  document.querySelector(`input[type=radio][name=theme][id=theme-${await fluneSettings.store.get("settings.design.theme")}]`).checked = true;

  // --オートセーブの設定を適用
  if (await fluneSettings.store.get("settings.autoSave")) {
    // 変更されたらすべて保存。
    inputElements.forEach((element) => {
      element.onchange = () => {
        isSaved = false;
        saveAll();
        console.info(element.id, "It was automatically saved.");
      };
    });
    window.onbeforeunload = () => {};
  } else {
    inputElements.forEach((element) => {
      element.onchange = () => {
        isSaved = false;
      };
    });
    window.onbeforeunload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
  }
}

// オプションを保存
function save(id, value) {
  fluneSettings.store.set(id, value);
  console.info("Saved option:", id, value);
}

// すべての設定を保存
function saveAll() {
  let inputElements = document.querySelectorAll(".content input, .content select, .content form");
  inputElements.forEach((element, index) => {
    const id = element.id;

    switch (id) {
      case "setting-auto-save":
        save("settings.autoSave", element.checked);
        break;
      case "toggle-home-button":
        save("settings.design.showHomeButton", element.checked);
        break;
      case "search-engine":
        save("settings.search.engine", element.value);
        break;
    }
  });

  save("settings.design.theme", document.querySelector("input[type=radio][name=theme]:checked").id.replace("theme-", ""));

  isSaved = true;
  console.info("All settings have been saved.");

  each();
}