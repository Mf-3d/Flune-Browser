import { CreatedTab, TabState } from "@/shared/types/preload-api";
import { updateTabsUI } from "..";
import { isDragging } from "../ui/tab-drag-events";
import { defaultIpc } from "@/renderer/ipc/default-ipc";

export function registerTabEvents() {
  if (!window.flune.navigation) return;

  window.flune.navigation.tab.onCreated(onCreated);
  window.flune.navigation.tab.onRemoved(onRemoved);
  window.flune.navigation.tab.onUpdated(OnUpdated);
  window.flune.navigation.tab.onReordered(onReordered);
}

function onCreated(_: Electron.IpcRendererEvent, tab: CreatedTab) {
  defaultIpc.log.info(`New tab is created: Tab ID: "${tab.id}"`);

  const tabContainer = document.getElementById("tabs")!;
  const newButton = tabContainer.querySelector(".new-button")!;

  const tabElement = document.createElement("span");

  tabElement.draggable = true;
  tabElement.classList.add("tab");
  tabElement.setAttribute("data-id", tab.id);

  const faviconElement = document.createElement("img");
  faviconElement.classList.add("favicon");
  faviconElement.onerror = () => (faviconElement.src = "/image/tab-no-favicon.png");

  const isLoadingElement = document.createElement("a");
  isLoadingElement.classList.add("loading", "diabled");
  isLoadingElement.innerHTML = '<i data-lucide="loader-circle"></i>';

  const titleElement = document.createElement("p");
  titleElement.classList.add("title");
  titleElement.innerHTML = tab.id;

  const rightElements = document.createElement("span");
  rightElements.classList.add("right");

  const isDownloadingElement = document.createElement("a");
  isDownloadingElement.classList.add("downloading", "disabled");
  isDownloadingElement.innerHTML = '<i data-lucide="download"></i>';

  const isAudibleElement = document.createElement("a");
  isAudibleElement.classList.add("audible", "disabled");
  isAudibleElement.innerHTML = '<i data-lucide="volume-2"></i>';

  rightElements.appendChild(isDownloadingElement);
  rightElements.appendChild(isAudibleElement);

  // TODO: rightElementsにまとめる
  const closeButtonElement = document.createElement("a");
  closeButtonElement.classList.add("close-button", "right");
  closeButtonElement.innerHTML = '<i data-lucide="x"></i>';

  tabElement.appendChild(faviconElement);
  tabElement.appendChild(isLoadingElement);
  tabElement.appendChild(titleElement);
  tabElement.appendChild(rightElements);
  tabElement.appendChild(closeButtonElement);

  /*
  element.innerHTML = `
  <img src="" class="favicon" onerror="this.src='/image/tab-no-favicon.png';"/>
  <a href="#" class="loading disabled">
    <i data-lucide="loader-circle"></i>
  </a>
  <p class="title">${tab.title}</p>
  <span class="right">
    <a href="#" class="downloading disabled">
      <i data-lucide="download"></i>
    </a>
    <a href="#" class="audible disabled">
      <i data-lucide="volume-2"></i>
    </a>
  </span>
  <a class="close-button right">
    <i data-lucide="x"></i>
  </a>
  `;
  */

  if (!tab.beforeTabId) {
    newButton.before(tabElement); // 一番右に追加
  } else {
    tabContainer.querySelector(`.tab[data-id="${tab.beforeTabId}"]`)?.after(tabElement);
  }

  if (tab.active) {
    const tabElements = tabContainer.querySelectorAll(".tab");

    tabElements.forEach((tabElement) => {
      if (tabElement.getAttribute("data-id") === tab.id) {
        tabElement.id = "opened";
      } else {
        tabElement.id = "";
      }
    });
  }

  updateTabsUI();
}

function onRemoved(_: Electron.IpcRendererEvent, id: string) {
  const tabContainer = document.getElementById("tabs")!;
  const tabElements = tabContainer.querySelectorAll(".tab");

  tabElements.forEach((tabElement) => {
    if (tabElement.getAttribute("data-id") === id) tabElement.remove();
  });

  updateTabsUI();
}

function OnUpdated(_: Electron.IpcRendererEvent, tab: TabState) {
  defaultIpc.log.info(`Tab has been updated: Tab ID: "${tab.id}"`);

  if (isDragging) return;

  const tabContainer = document.getElementById("tabs")!;
  const tabElements = tabContainer.querySelectorAll(".tab");

  tabElements.forEach((tabElement) => {
    if (tabElement.getAttribute("data-id") !== tab.id) return;

    if (tab.title !== undefined) {
      defaultIpc.log.info(`Navigation state changed: title: "${tab.title}"`);
      const titleElement = tabElement.querySelector("p.title")! as HTMLElement;
      titleElement.innerText = tab.title;
    }

    if (tab.favicon !== undefined) {
      defaultIpc.log.info(`Navigation state changed: favicon: "${tab.favicon}"`);
      const faviconElement = tabElement.querySelector("img.favicon")! as HTMLElement;
      faviconElement.setAttribute("src", tab.favicon);
    }

    if (tab.isLoading !== undefined) {
      defaultIpc.log.info(`Navigation state changed: isLoading: ${tab.isLoading}`);
      const loadingElement = tabElement.querySelector("a.loading")! as HTMLElement;

      if (tab.isLoading) loadingElement.classList.remove("disabled");
      else loadingElement.classList.add("disabled");
    }

    if (tab.isAudible !== undefined) {
      defaultIpc.log.info(`Navigation state changed: isAudible: ${tab.isAudible}`);
      const audibleElement = tabElement.querySelector("a.audible")! as HTMLElement;

      if (tab.isAudible) audibleElement.classList.remove("disabled");
      else audibleElement.classList.add("disabled");
    }
  });

  if (tab.active !== undefined) {
    tabElements.forEach((tabElement) => {
      if (tabElement.getAttribute("data-id") === tab.id) {
        tabElement.id = "opened";
      } else {
        tabElement.id = "";
      }
    });
  }

  updateTabsUI();
}

function onReordered(_: Electron.IpcRendererEvent, order: string[]) {
  const tabContainer = document.getElementById("tabs")!;

  for (const id of order) {
    const tabElement = document.querySelector(`[data-id="${id}"]`);
    if (tabElement) tabContainer.appendChild(tabElement);
  }

  // 最後に追加
  const newButton = tabContainer.querySelector(".new-button")!;
  tabContainer.appendChild(newButton);
}
