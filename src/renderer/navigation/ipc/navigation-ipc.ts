export const navigationIpc = {
  createTab() {
    window.flune.navigation?.tab.create();
  },

  removeTab(id: string) {
    window.flune.navigation?.tab.remove(id);
  },

  activateTab(id: string) {
    window.flune.navigation?.tab.activate(id);
  },

  reloadTab(options?: {
    ignoringCache: boolean;
  }) {
    window.flune.navigation?.tab.reload(options);
  },

  navigate(id: string | undefined, word: string) {
    window.flune.navigation?.tab.navigate(id, word);
  },

  goBack() {
    window.flune.navigation?.tab.goBack();
  },

  goForward() {
    window.flune.navigation?.tab.goForward();
  },

  goHome() {
    window.flune.navigation?.tab.goHome();
  },

  toggleBookmark() {
    window.flune.navigation?.toggleBookmark();
  },

  updateSymbolColor(color: string) {
    window.flune.navigation?.updateSymbolColor(color);
  }
};