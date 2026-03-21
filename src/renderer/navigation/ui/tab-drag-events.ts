import { updateTabsUI } from "..";

export let isDragging: boolean = false;

export function registerTabDragEvents() {
  const tabContainer = document.getElementById("tabs");

  tabContainer?.addEventListener("dragstart", onDragStart);
  tabContainer?.addEventListener("dragover", onDragOver);
  tabContainer?.addEventListener("dragleave", onDragLeave);
  tabContainer?.addEventListener("dragend", onDragEnd);
  tabContainer?.addEventListener("drop", onDrop);
}

function onDragStart(event: DragEvent) {
  event.dataTransfer!.effectAllowed = "move";
  const target = event.target as HTMLElement;
  event.dataTransfer!.setData("text/plain", target.getAttribute("data-id")!);

  isDragging = true;
}

function onDragOver(event: DragEvent) {
  event.preventDefault();

  const tabElement = (event.target as HTMLElement).closest(".tab");

  if (!tabElement) return;

  const rect = tabElement.getBoundingClientRect();
  if (event.clientX - rect.left < tabElement.clientWidth / 2) {
    //マウスカーソルの位置が要素の半分より左
    tabElement.classList.add("adding-left");
    tabElement.classList.remove("adding-right");
  } else {
    //マウスカーソルの位置が要素の半分より右
    tabElement.classList.remove("adding-left");
    tabElement.classList.add("adding-right");
  }
}

function onDragLeave(event: DragEvent) {
  const tabElement = (event.target as HTMLElement).closest(".tab");

  if (!tabElement) return;

  tabElement.classList.remove("adding-left");
  tabElement.classList.remove("adding-right");
}

function onDragEnd(event: DragEvent) {
  const tabElement = (event.target as HTMLElement).closest(".tab");

  if (!tabElement) return;

  tabElement.classList.remove("adding-left");
  tabElement.classList.remove("adding-right");

  isDragging = false;
}

function onDrop(event: DragEvent) {
  event.preventDefault();

  const tabContainer = document.getElementById("tabs");
  const tabElement = (event.target as HTMLElement).closest(".tab");

  if (!tabElement || !tabContainer) return;

  const tabId = event.dataTransfer!.getData("text/plain");
  const draggedTab = tabContainer.querySelector(`.tab[data-id="${tabId}"]`)!;

  const rect = tabElement.getBoundingClientRect();
  if (event.clientX - rect.left < tabElement.clientWidth / 2) {
    //マウスカーソルの位置が要素の半分より左
    tabElement.insertAdjacentElement("beforebegin", draggedTab);
    window.flune.navigation?.tab.move(
      tabId,
      tabElement.getAttribute("data-id")!,
      "before"
    );
  } else {
    //マウスカーソルの位置が要素の半分より右
    tabElement.insertAdjacentElement("afterend", draggedTab);
    window.flune.navigation?.tab.move(
      tabId,
      tabElement.getAttribute("data-id")!,
      "after"
    );
  }

  tabContainer.querySelectorAll(".tab").forEach((el) => {
    el.classList.remove("adding-left");
    el.classList.remove("adding-right");
  });

  event.dataTransfer!.clearData("text/plain");

  updateTabsUI();
}
