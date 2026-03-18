import { settingsIpc } from "../../ipc/settings-ipc";

import type { Path, PathValue } from "../../../../shared/types/path";
import type { Config } from "../../../../shared/types/config";

export const SettingsActions = {
  save<P extends Path<Config>>(key: P, value?: PathValue<Config, P> | undefined) {
    settingsIpc.set(key, value);
    console.info("Option saved:", key, value);
  },
  async saveAll() {
    const inputElements = document.querySelectorAll(".content input") as NodeListOf<HTMLInputElement>;
    const selectElements = document.querySelectorAll(".content select") as NodeListOf<HTMLSelectElement>;
    const formElements = document.querySelectorAll(".content form") as NodeListOf<HTMLFormElement>;

    inputElements.forEach(async (element) => {
      const id = element.id;

      switch (id) {
        case "setting-auto-save":
          this.save("settings.autoSave", element.checked);
          break;
        case "toggle-home-button":
          this.save("settings.design.showHomeButton", element.checked);
          break;
      }
    });

    selectElements.forEach(async (element) => {
      const id = element.id;

      switch (id) {
        case "search-engine":
          this.save("settings.search.engine", element.value);
          break;
      }
    });

    const themeElement = 
      document.querySelector("input[type=radio][name=theme]:checked") as HTMLInputElement;

    this.save("settings.design.theme", themeElement.id.replace("theme-", ""));

    console.info("All settings have been saved.");

    // each();
  }
}