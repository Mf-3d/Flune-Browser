import { CreatedTab, TabState } from "@/shared/types/preload-api";
import { navigationActions } from "../actions/navigation-actions";
import { updateTabsUI } from "..";

export function registerTabEvents() {
  if (!window.flune.navigation) return;

  window.flune.navigation.tab.onCreated(onCreated);
  window.flune.navigation.tab.onRemoved(onRemoved);
  window.flune.navigation.tab.onUpdated(OnUpdated);
}

function onCreated(_: Electron.IpcRendererEvent, tab: CreatedTab) {
  const tabContainer = document.getElementById("tabs")!;
  const newButton = tabContainer.querySelector(".new-button")!;

  const element = document.createElement("span");

  element.draggable = true;
  element.classList.add("tab");
  element.setAttribute("data-id", tab.id);

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

  if (!tab.beforeTabId) {
    newButton.before(element); // 一番右に追加
  } else {
    tabContainer.querySelector(`.tab[data-id="${tab.beforeTabId}"]`)?.after(element);
  }
  
  if (tab.active) navigationActions.activateTab(tab.id);

  updateTabsUI();
}

function onRemoved(_: Electron.IpcRendererEvent, id: string) {
  const tabContainer = document.getElementById("tabs")!;
  const tabElements = tabContainer.querySelectorAll(".tab");

  tabElements.forEach(tabElement => {
    if (tabElement.getAttribute("data-id") === id) tabElement.remove();
  });

  updateTabsUI();
}

function OnUpdated(_: Electron.IpcRendererEvent, tab: TabState) {
  const tabContainer = document.getElementById("tabs")!;
  const tabElements = tabContainer.querySelectorAll(".tab");

  tabElements.forEach((tabElement) => {
    if (tabElement.getAttribute("data-id") !== tab.id) return;

    if (tab.title !== undefined) {
      console.info("(change-state) title:", tab.title);
      const titleElement = tabElement.querySelector("p.title")! as HTMLElement;
      titleElement.innerText = tab.title;
    }

    if (tab.favicon !== undefined) {
      console.info("(change-state) favicon:", tab.favicon);
      const faviconElement = tabElement.querySelector("img.favicon")! as HTMLElement;
      faviconElement.setAttribute("src", tab.favicon);
    }

    if (tab.isLoading !== undefined) {
      console.info("(change-state) loading:", tab.isLoading);
      const loadingElement = tabElement.querySelector("a.loading")! as HTMLElement;

      if (tab.isLoading) loadingElement.classList.remove("disabled");
      else loadingElement.classList.add("disabled");
    }

    if (tab.isAudible !== undefined) {
      console.info("(change-state) audible:", tab.isAudible);
      const audibleElement = tabElement.querySelector("a.audible")! as HTMLElement;

      if (tab.isAudible) audibleElement.classList.remove("disabled");
      else audibleElement.classList.add("disabled");
    }
  });

  if (tab.active !== undefined) {
    navigationActions.activateTab(tab.id);
  }

  updateTabsUI();
}