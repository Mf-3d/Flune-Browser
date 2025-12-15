window.addEventListener("DOMContentLoaded", () => {
  each();
});

async function each() {
  // --エンジンのオプションを追加
  const selectEngines = document.getElementById("search-engine");

  selectEngines.childNodes.forEach(option => selectEngines.remove(option.value));

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

  // --設定フォームの状態を更新
  let inputElements = document.querySelectorAll(".content input, .content select");

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
    inputElements.forEach((element) => {
      element.onchange = () => {
        saveAll();
        each();
      };
    });
  } else {
    inputElements.forEach((element) => {
      element.onchange = () => {};
    });
  }
}

function save(id, value) {
  fluneSettings.store.set(id, value);
  console.info(id, value);
}

function saveAll() {
  let inputElements = document.querySelectorAll(".content input, .content select, .content form");
  inputElements.forEach((element, index) => {
    const id = element.id;
    
      switch (id) {
        case "setting-auto-save":
          console.info(index, id);
          save("settings.autoSave", element.checked);
          break;
        case "toggle-home-button":
          console.info(index, id);
          save("settings.design.showHomeButton", element.checked);
          break;
        case "search-engine":
          console.info(index, id);
          save("settings.search.engine", element.value);
          break;
      }
  });

  save("settings.design.theme", document.querySelector("input[type=radio][name=theme]:checked").id.replace("theme-", ""))
}