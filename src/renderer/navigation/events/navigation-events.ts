import { NavigationState } from "@/shared/types/preload-api";
import { applyTheme } from "../theme";
import { navigationActions } from "../actions/navigation-actions";

export function registerNavigationEvents() {
  if (!window.flune.navigation) return;

  window.flune.navigation.onInit(onInit);
  window.flune.navigation.onStateUpdated(onStateUpdated);
  window.flune.navigation.onThemeChanged(onThemeChanged);
}

function onInit(_: Electron.IpcRendererEvent, state: NavigationState) {
  if (state.showHomeButton !== undefined) {
    const homeButton = document.getElementById("go-home")!;

    state.showHomeButton ? homeButton.classList.remove("invisible") : homeButton.classList.add("invisible");
  }
}

function onStateUpdated(_: Electron.IpcRendererEvent, state: NavigationState) {
  if (state.showHomeButton !== undefined) {
    const homeButton = document.getElementById("go-home")!;

    state.showHomeButton ? homeButton.classList.remove("invisible") : homeButton.classList.add("invisible");
  }

  if (state.input !== undefined) {
    const input = document.getElementById("search-bar") as HTMLInputElement;

    input.value = state.input;
  }

  if (state.isBookmarked !== undefined) {
    const bookmarkElement = document.querySelector("#toggle-bookmark")!;

    if (state.isBookmarked) {
      bookmarkElement.classList.add("active");
    } else {
      bookmarkElement.classList.remove("active");
    }
  }

  if (state.canGoBack !== undefined) {
    const goBackElement = document.querySelector(".go-back")!;

    if (state.canGoBack) {
      goBackElement.classList.remove("disabled");
    } else {
      goBackElement.classList.add("disabled");
    }
  }

  if (state.canGoForward !== undefined) {
    const goForwardElement = document.querySelector(".go-forward")!;

    if (state.canGoForward) {
      goForwardElement.classList.remove("disabled");
    } else {
      goForwardElement.classList.add("disabled");
    }
  }
}

function onThemeChanged(_: Electron.IpcRendererEvent, themeUrl: string) {
  applyTheme(themeUrl, navigationActions.updateSymbolColor);
}