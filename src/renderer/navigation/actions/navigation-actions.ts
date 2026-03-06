import { navigationIpc } from "../ipc/navigation-ipc";

export const navigationActions = {
  createTab() {
    navigationIpc.createTab();
  },

  removeTab(id: string) {
    navigationIpc.removeTab(id);
  },

  reloadTab(options?: {
    ignoringCache: boolean;
  }) {
    navigationIpc.reloadTab(options);
  },

  goBack() {
    navigationIpc.goBack();
  },

  goForward() {
    navigationIpc.goForward();
  },

  activateTab(id: string) {
    navigationIpc.activateTab(id);
  },

  goHome() {
    navigationIpc.goHome();
  },

  toggleBookmark() {
    navigationIpc.toggleBookmark();
    document.getElementById("toggle-bookmark")?.classList.toggle("active");
  },

  updateSymbolColor() {
    const styles = getComputedStyle(document.documentElement);
    const color = styles.getPropertyValue("--text-color");

    navigationIpc.updateSymbolColor(color);
  },

  search() {
    const input = document.querySelector("#search-bar")! as HTMLInputElement;

    const activeTab = document.querySelector("#tabs > #opened")!;
    navigationIpc.navigate(activeTab.getAttribute("data-id")!, input.value);
    input.value = ""; // ロードされたらすぐに値が代入されるが、念のため一度リセットする。
    input.blur();
  }
};