import { navigationActions } from "../actions/navigation-actions";

export function registerClickEvents() {
  const newButton = document.getElementById("new-button");
  const goBackButton = document.getElementById("go-back");
  const goForwardButton = document.getElementById("go-forward");
  const goHomeButton = document.getElementById("go-home");
  const reloadButton = document.getElementById("reload-tab");
  const toggleBookmarkButton = document.getElementById("toggle-bookmark");
  const searchButton = document.getElementById("search-button");
  const optionMenuButton = document.getElementById("option-menu-button");
  const tabContainer = document.getElementById("tabs");

  newButton?.addEventListener("click", () => navigationActions.createTab());

  goBackButton?.addEventListener("click", () => navigationActions.goBack());

  goForwardButton?.addEventListener("click", () => navigationActions.goForward());

  goHomeButton?.addEventListener("click", () => navigationActions.goHome());

  reloadButton?.addEventListener("click", () => navigationActions.reloadTab());

  toggleBookmarkButton?.addEventListener("click", () =>
    navigationActions.toggleBookmark()
  );

  searchButton?.addEventListener("click", () => navigationActions.search());

  optionMenuButton?.addEventListener("click", () => navigationActions.toggleOptionMenu());

  tabContainer?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const tabElement = target.closest(".tab");

    if (!tabElement) return;

    const tabId = tabElement.getAttribute("data-id")!;
    const titleElement = target.closest(".title") as HTMLElement;
    const closeButtonElement = target.closest(".close-button") as HTMLElement;

    if (titleElement) {
      navigationActions.activateTab(tabId);
    } else if (closeButtonElement) {
      navigationActions.removeTab(tabId);
    }
  });
}
