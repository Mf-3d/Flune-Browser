import { SettingsActions } from "./actions/settings-actions";
import { registerAutoSaveEvent } from "./events/auto-save-events";

window.addEventListener("DOMContentLoaded", onInit);

function onInit() {
  const saveButton = document.getElementById("save-button");
  saveButton?.addEventListener("click", () => {
    SettingsActions.saveAll();
    updateSettingsUI();
  });

  updateSettingsUI();
  registerAutoSaveEvent();
}

async function updateEnginesUI() {
  if (!window.flune.settings) return;

  const selectEnginesElement = document.querySelector("#search-engine") as HTMLElement;

  selectEnginesElement.childNodes.forEach((engineElement) => engineElement.remove());

  const engines = (await window.flune.settings.get("searchEngines")).map((engine) => ({
    id: engine.id,
    name: engine.name,
  }));

  engines.forEach((engine) => {
    const optionElement = document.createElement("option");
    optionElement.value = engine.id;
    optionElement.innerHTML = engine.name;

    selectEnginesElement.appendChild(optionElement);
  });
}

async function updateThemesUI() {
  if (!window.flune.settings) return;

  const themeSelectorElement = document.getElementById("theme-select") as HTMLElement;

  themeSelectorElement.innerHTML = "";

  const themes = (await window.flune.settings.get("themes")).map((theme) => ({
    id: theme.id,
    name: theme.name,
  }));

  themes.forEach((theme) => {
    const inputElement = document.createElement("input");
    inputElement.type = "radio";
    inputElement.id = `theme-${theme.id}`;
    inputElement.name = "theme";

    const labelElement = document.createElement("label");
    labelElement.htmlFor = `theme-${theme.id}`;
    labelElement.innerText = theme.name;

    themeSelectorElement.appendChild(inputElement);
    themeSelectorElement.appendChild(labelElement);
  });
}

async function updateOptionsUI() {
  if (!window.flune.settings) return;

  const inputElements = document.querySelectorAll(
    ".content input"
  ) as NodeListOf<HTMLInputElement>;
  const selectElements = document.querySelectorAll(
    ".content select"
  ) as NodeListOf<HTMLSelectElement>;

  inputElements.forEach(async (element) => {
    if (!window.flune.settings) return;

    const id = element.id;

    switch (id) {
      case "setting-auto-save":
        element.checked = (await window.flune.settings.get("settings")).autoSave;
        break;
      case "toggle-home-button":
        element.checked = (
          await window.flune.settings.get("settings")
        ).design.showHomeButton;
        break;
    }
  });

  selectElements.forEach(async (element) => {
    if (!window.flune.settings) return;

    const id = element.id;

    switch (id) {
      case "search-engine":
        element.value = (await window.flune.settings.get("settings")).search.engine;
        break;
    }
  });

  const themeElement = document.querySelector(
    `input[id=theme-${(await window.flune.settings.get("settings")).design.theme}]`
  ) as HTMLInputElement;
  themeElement.checked = true;
}

async function updateSettingsUI() {
  if (!window.flune.settings) return;

  updateEnginesUI();
  updateThemesUI();
  updateOptionsUI();
}
