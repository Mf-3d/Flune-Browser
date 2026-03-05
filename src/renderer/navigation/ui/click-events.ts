import { navigationActions } from "../actions/navigation-actions";

export function registerClickEvents() {
  const newButton = document.getElementById("new-button");
  const goBackButton = document.getElementById("go-back");
  const goForwardButton = document.getElementById("go-forward");
  const goHomeButton = document.getElementById("go-home");
  const reloadButton = document.getElementById("reload-tab");
  const toggleBookmarkButton = document.getElementById("toggle-bookmark");
  const searchButton = document.getElementById("search-button");

  newButton?.addEventListener("click", () => navigationActions.createTab());

  goBackButton?.addEventListener("click", () => navigationActions.goBack());

  goForwardButton?.addEventListener("click", () => navigationActions.goForward());

  goHomeButton?.addEventListener("click", () => navigationActions.goHome());

  reloadButton?.addEventListener("click", () => navigationActions.reloadTab());

  toggleBookmarkButton?.addEventListener("click", () => navigationActions.toggleBookmark());

  searchButton?.addEventListener("click", () => navigationActions.search());
}