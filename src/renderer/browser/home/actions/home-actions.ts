import { browserIpc } from "../../ipc/browser-ipc";

export const HomeActions = {
  search() {
    const inputElement = document.getElementById("search-bar") as HTMLInputElement;

    if (!inputElement) return;

    browserIpc.navigate(inputElement.value);
    inputElement.blur();
  }
}