const Store = require('electron-store');
const store = new Store();

let maxLength = 50;

/**
 * History manager.
 * @author mf7cli
 */
module.exports = {
  changeActiveHistory (number, open_tab) {
    let history = store.get('history', []);
    if (!history[open_tab]) history[open_tab] = [];

    if (!history[open_tab][number]) return;

    history[open_tab][this.getActiveHistory(open_tab)].active = false;

    history[open_tab][number].active = true;

    if (history[open_tab].length - 1 > maxLength) {
      history[open_tab].splice(0, 1);
    }

    store.set('history', history);
  },

  getActiveHistory (open_tab) {
    let history = store.get('history', []);
    if (!history[open_tab]) history[open_tab] = [];

    let activeHistory;
    for (let i = 0; i < history[open_tab].length; i++) {
      const element = history[open_tab][i];
      
      if (element.active) {
        activeHistory = i;
        break;
      }
    }
    return activeHistory;
  },

  addHistory (url, data, open_tab) {
    let history = store.get('history', []);
    if (!history[open_tab]) history[open_tab] = [];

    if (history[open_tab][history[open_tab].length - 1]) 
      if (history[open_tab][history[open_tab].length - 1].url === url) return;

    history[open_tab][history[open_tab].length] = {url, data, active: true};

    if (history[open_tab].length - 1 > maxLength) {
      history[open_tab].splice(0, 1);
    }

    store.set('history', history);

    this.changeActiveHistory(history[open_tab].length - 1, open_tab);
  },

  getHistoryAll () {
    return store.get('history');
  },

  getHistory (number, open_tab) {
    return store.get('history')[open_tab][number];
  },

  deleteHistory (number, open_tab) {
    let history = store.get('history', []);
    if (!history[open_tab]) history[open_tab] = [];

    history[open_tab].splice(number, 1);

    store.set('history', history);
  },

  deleteHistoryTab (number) {
    let history = store.get('history', []);

    history.splice(number, 1);

    store.set('history', history);
  }
}