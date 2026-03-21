import { applyTheme } from "./theme";
import { defaultIpc } from "../ipc/default-ipc";

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
}

function onThemeChanged(_: Electron.IpcRendererEvent, themeUrl: string) {
  applyTheme(themeUrl);
}
