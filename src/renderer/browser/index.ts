import { browserIpc } from "./ipc/browser-ipc";

window.addEventListener("DOMContentLoaded", onInit);

async function onInit() {
  const fluneVersion = (await browserIpc.getVersion())
  .replace("-beta.", " Beta ")
  .replace("-dev.", " Dev ");

  document.querySelectorAll(".flune-version").forEach((element) => {
    element.innerHTML = fluneVersion;
  });
}