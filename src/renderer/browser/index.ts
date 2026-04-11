import lucide from "../utils/icons";
import { applyTheme } from "./theme";
import { defaultIpc } from "../ipc/default-ipc";
import { IpcRendererEvent } from "electron";

window.addEventListener("DOMContentLoaded", () => {
  if (!window.flune.browser) return;

  onInit();

  window.flune.browser.onThemeChanged(onThemeChanged);
});

async function onInit() {
  const fluneVersion = (await defaultIpc.getVersion())
    .replace("-beta.", " Beta ")
    .replace("-dev.", " Dev ");

  document.querySelectorAll(".flune-version").forEach((element) => {
    element.innerHTML = fluneVersion;
  });

  lucide.createIcons();
}

function onThemeChanged(_: IpcRendererEvent, themeUrl: string) {
  applyTheme(themeUrl);
}
