import { SettingsActions } from "../actions/settings-actions";

export async function registerAutoSaveEvent() {
  if (!window.flune.settings) return;

  const inputElements = document.querySelectorAll(
    ".content input"
  ) as NodeListOf<HTMLInputElement>;
  const selectElements = document.querySelectorAll(
    ".content select"
  ) as NodeListOf<HTMLSelectElement>;
  const formElements = document.querySelectorAll(
    ".content form"
  ) as NodeListOf<HTMLSelectElement>;

  if ((await window.flune.settings.get("settings")).autoSave) {
    // 変更されたらすべて保存。
    inputElements.forEach((element) => {
      element.addEventListener("change", onChange);
    });
    selectElements.forEach((element) => {
      element.addEventListener("change", onChange);
    });
    formElements.forEach((element) => {
      element.addEventListener("change", onChange);
    });

    window.removeEventListener("beforeunload", onBeforeUnload);
  } else {
    inputElements.forEach((element) => {
      element.removeEventListener("change", onChange);
    });
    selectElements.forEach((element) => {
      element.removeEventListener("change", onChange);
    });

    window.addEventListener("beforeunload", onBeforeUnload);
  }
}

function onChange() {
  SettingsActions.saveAll();
  // each();
}

function onBeforeUnload(event: BeforeUnloadEvent) {
  event.preventDefault();
  event.returnValue = "";
}
