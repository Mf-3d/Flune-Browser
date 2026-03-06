import { browserIpc } from "../ipc/browser-ipc";

window.addEventListener("DOMContentLoaded", onInit);

async function onInit() {
  const versions = await browserIpc.getVersions();

  document.querySelectorAll(".version-flune").forEach((element) => {
    element.classList.remove("undefined");
    element.innerHTML = versions.flune;
  });

  document.querySelectorAll(".version-electron").forEach((element) => {
    element.classList.remove("undefined");
    element.innerHTML = versions.electron;
  });

  document.querySelectorAll(".version-node").forEach((element) => {
    element.classList.remove("undefined");
    element.innerHTML = versions.node;
  });

  document.querySelectorAll(".version-chrome").forEach((element) => {
    element.classList.remove("undefined");
    element.innerHTML = versions.chrome;
  });

  document.querySelectorAll(".version-v8").forEach((element) => {
    element.classList.remove("undefined");
    element.innerHTML = versions.v8;
  });
}