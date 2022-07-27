// モジュール読み込み
const electron = require("electron");
const Store = require('electron-store');
const log = require('electron-log');
const request = require('request');
const os = require('os');
const xml2js = require("xml2js");
const setProtocol = require('./main/protocol');
const appSync = require('./main/sync');
const Tab = require('./main/tab');
const message = require('./main/message');
const { setupTitlebar, attachTitlebarToWindow } = require('custom-electron-titlebar/main');
/** @type {message} */ let Notification;

// ログ関連
console.log = log.log;
console.debug = log.debug;
console.log(`\x1b[48;2;58;106;194m\x1b[38;2;255;255;255m INFO \x1b[0m Flune-Browserを起動中です...`);

// 例外エラー
process.on('uncaughtException', (err) => {
  log.error(err);

  console.log('\x1b[41m\x1b[37mAn error has occurred.\x1b[0m');

  Notification.show('アプリで予期しないエラーが発生しました。<br/>アプリを終了しますか？', 'info', ['アプリを終了する', 'アプリを終了せずに続ける(非推奨)'], (event, value) => {
    if(value === 0){
      electron.app.quit();
    }
  });
});

// config
const store = new Store();

// FluneSync
const browserSync = new appSync(store.get('syncAccount.user', null), store.get('syncAccount.password', null));

// 変数
/** @type {electron.BrowserWindow} */let win;
let setting_win;
let login_win;
let suggestView;
let winSize;
let open_tab = 1;
/** @type {Tab} */
let tab;

// 一応使ってるやつ
const isMac = (process.platform === 'darwin');

function ns() {
  tab.loadURL('flune://setting');
}

function nw() {
  suggestView = new electron.BrowserView({
    transparent: true,
    backgroundColor: '#ffffff',
    webPreferences: {
      scrollBounce: false,
      worldSafeExecuteJavaScript: true,
      nodeIntegration:false,
      contextIsolation: true,
      preload: `${__dirname}/preload/preload_suggest.js`
    }
  });

  if(isMac){
    log_path = os.homedir() + '/Library/Logs/flune-browser/';
    console.log('ログの保存場所:', os.homedir() + '/Library/Logs/flune-browser/');
  } else if(process.platform === 'win32'){
    log_path = os.homedir() + '/AppData/Roaming/flune-browser/logs/';
    console.log('ログの保存場所:', os.homedir() + '/AppData/Roaming/flune-browser/logs/');
  } else{
    log_path = '/';
    console.log('ログの保存場所を取得できませんでした。')
  }


  let db_winSize = store.get('window.window_size', [1200, 700]);

  /** @type {electron.BrowserWindowConstructorOptions} */ let winOption = {
      width: db_winSize[0], height: db_winSize[1], minWidth: 600, minHeight: 400,
      frame: false,
      transparent: false,
      backgroundColor: '#ffffff',
      title: `Flune-Browser ${electron.app.getVersion()}`,
      // icon: `${__dirname}/src/image/logo.png`,
      webPreferences: {
        nodeIntegration:false,
        contextIsolation: true,
        preload: `${__dirname}/preload/preload.js`
      }
    };
  if(isMac){
    winOption.titleBarStyle = 'hidden';
    win = new electron.BrowserWindow(winOption);

    win.loadFile(`${__dirname}/src/views/menu.html`);
    // win.loadFile(`${__dirname}/src/views/notification.html`);

    // win.setTouchBar(touchBar);
  }
  else {
    win = new electron.BrowserWindow(winOption);
    win.loadFile(`${__dirname}/src/views/menu_win.html`);
  }

  winSize = win.getSize();

  tab = new Tab(win, winSize, __dirname);

  module.exports = {
    tab: tab,
    win: win,
    dirname: __dirname
  }

  // toggleCircleDock();
  // nt();
  tab.nt();

  electron.session.defaultSession.loadExtension(__dirname + '/Extension/gebbhagfogifgggkldgodflihgfeippi').then(({ id, manifest, url }) => {
    // win.webContents.loadURL('chrome-extension://gebbhagfogifgggkldgodflihgfeippi/popup.html');
  });

  electron.session.defaultSession.setPermissionRequestHandler((webContents, permission, callback, details) => {
    if(permission === 'media' && details.mediaTypes.includes('audio')){
      Notification.show('Webサイトがマイクへのアクセスを要求しています。<br/>アクセスを許可しますか？', 'info', ['はい', 'いいえ'], (event, value) => {
        if(value === 0){
          callback(true);
        } else {
          callback(false);
        }
      });
    }

    if(permission === 'media' && details.mediaTypes.includes('video')){
      Notification.show('Webサイトがカメラへのアクセスを要求しています。<br/>アクセスを許可しますか？', 'info', ['はい', 'いいえ'], (event, value) => {
        if(value === 0){
          callback(true);
        } else {
          callback(false);
        }
      });
    }

    if(permission === 'notifications'){
      Notification.show('Webサイトが通知の送信を要求しています。<br/>送信を許可しますか？', 'info', ['はい', 'いいえ'], (event, value) => {
        if(value === 0){
          callback(true);
        } else {
          callback(false);
        }
      });
    }
  });

  Notification = new message(win);

  win.on('resize', () => {
    winSize = win.getSize();
  });

  win.on('close', () => {
    tab.deleteTabAll();
    store.set('window.window_size', winSize);

    win.webContents.destroy();
    suggestView = null;
  });

  win.on('closed', () => {
    tab.deleteTabAll();
    win = null;
  });
}

electron.app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (!isMac) {
    electron.app.quit();
  }
});

electron.app.on('activate', () => {
  if(win === null){
    nw();
  }
});

electron.app.on("ready", () => {
  let dockMenu = electron.Menu.buildFromTemplate([
    {
      label: '設定',
      click: () => {
        ns();
      }
    }
  ]);

  if (process.platform === 'darwin') {
    electron.app.dock.setMenu(dockMenu);
  }

  setProtocol(__dirname);

  nw();

  try{
    if(browserSync.compare().status !== 0){
      console.log(`\x1b[48;2;58;106;194m\x1b[38;2;255;255;255m INFO \x1b[0m ブラウザ同期にログインしていません`);
    }
  } catch(e) {
    console.log(`\x1b[48;2;58;106;194m\x1b[38;2;255;255;255m INFO \x1b[0m ブラウザ同期にログインしていません`);
  }

});

electron.ipcMain.handle('getWinSize', (event, index) => {
  return winSize;
});

electron.ipcMain.handle('new_tab', (event, data) => {
  tab.nt();
});

electron.ipcMain.handle('close_tab', (event, index) => {
  // close_tab(index);
  tab.deleteTab(index);
});

electron.ipcMain.handle('open_tab', (event, index) => {
  tab.ot(index);

  win.webContents.send('each');

  removeSuggestView();
});

electron.app.on('certificate-error', function(event, webContents, url, error, certificate, callback) {
  event.preventDefault();
  electron.dialog.showMessageBox(win, {
    title: '証明書エラー',
    message: `「${certificate.issuerName}」からの証明書を信頼しますか？`,
    detail: `URL: ${url}\nError: ${error}`,
    type: 'warning',
    buttons: [
      'はい',
      'いいえ'
    ],
    cancelId: 1
  }, function(response) {
    if (response === 0) {
      callback(true);
    }
    else {
      callback(false);
    }
  });
});

electron.ipcMain.handle('theme_path', () => {
  let theme;
  try{
    if(store.get('settings.theme') === 'theme_dark'){
      theme = '../style/theme/dark_theme.css';
    }
    else if(store.get('settings.theme') === 'theme_light'){
      theme = '../style/theme/light_theme_stylish.css';
    }
    else if(store.get('settings.theme') === 'elemental_theme_light'){
      theme = '../style/theme/light_theme.css';
      store.set('settings.theme', 'theme_light');
    }
    else{
      theme = '../style/theme/dark_theme.css';
    }
  }
  catch(e){
    theme = '../style/theme/dark_theme.css';
  }
  
  return theme;
});

electron.ipcMain.handle('go_back', (event, data) => {
  // bv[open_tab].webContents.goBack();
  tab.goBack();
  tab.setTitle();
});

electron.ipcMain.handle('go_forward', (event, data) => {
  // bv[open_tab].webContents.goForward();
  tab.goForward();
  tab.setTitle();
});

electron.ipcMain.handle('context', (event, data) => {
  context_menu.popup();
});

electron.ipcMain.handle('context_nav', (event, data) => {
  context_menu_nav.popup();
});

electron.ipcMain.handle('context_img', (event, data) => {
  let context_menu_img = new electron.Menu([
    {
      label: '画像をコピー',
      click: () => {
        tab.nt();
        electron.clipboard.writeImage(electron.nativeImage.createFromDataURL(data));
      }
    }
  ]);

  context_menu_img.popup();
});

electron.ipcMain.handle('login', async (event, data) => {
  console.log(await new appSync(data[0], data[1]).compare());
  if(new appSync(data[0], data[1]).compare() === {}) return;
  if(new appSync(data[0], data[1]).compare().status === 0){
    console.log(new appSync(data[0], data[1]).compare())
    browserSync = new appSync(data[0], data[1]);
    login_win.close();
    login_win = null;
  } else {
    login_win.webContents.send('loginError', new appSync(data[0], data[1]).compare().message);
  }
});

electron.ipcMain.handle('more_button_menu', (event, data) => {
  let more_button_context = new electron.Menu([
    {
      label: '新しいタブ',
      click: () => {
        tab.nt();
        win.webContents.send('new_tab_elm');
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'mf7cli-BBSアカウントでログイン',
      click: () => {
        
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'ブックマーク',
      id: 'bookmark',
      submenu: [
        {
          label: 'ブックマークがありません',
          enabled: false
        }
      ]
    }
  ]);

  let newtabItem = new electron.MenuItem({
    label: '設定',
    click: () => {
      // if(!setting_win){
      //   ns();
      // }
      // else{
      //   setting_win.close();
      //   setting_win = null;
      // }
      ns();
    }
  });

  more_button_context.append(newtabItem);

  let separetorItem = new electron.MenuItem({
    type: 'separator'
  });

  more_button_context.append(separetorItem);

  let loginMenuItem =new electron.MenuItem({
    label: 'mf7cli-BBSアカウントでログイン',
    click: () => {
      login_win = new electron.BrowserWindow({
        width: 200,
        height: 200,
        minWidth: 200,
        minHeight: 200,
        webPreferences: {
          scrollBounce: true,
          preload: `${__dirname}/preload/preload_login.js`
        }
      });

      login_win.setBounds({
        width: 500,
        height: 700
      });

      login_win.webContents.loadFile(`${__dirname}/src/views/login.html`);

      login_win.webContents.openDevTools();
    },
    enabled: false
  });

  more_button_context.append(loginMenuItem);
  more_button_context.append(separetorItem);

  if(store.get('bookmark', []) !== []){
    let bookmark_list = store.get('bookmark', []);
  
    let menuItem = new electron.MenuItem({
      label: 'ブックマーク',
      submenu: []
    });

    for (let i = 0; i < bookmark_list.length; i++) {

      let bookmarkItem = new electron.MenuItem({
        label: bookmark_list[i].title,
        submenu: [
          {
            label: '開く',
            click: () => {
              tab.loadURL(bookmark_list[i].url);
            }
          },
          {
            label: '新しいタブで開く',
            click: () => {
              tab.nt(bookmark_list[i].url);
              win.webContents.send('new_tab_elm', {});
            }
          },
          {
            type: 'separator'
          },
          {
            label: '削除',
            click: () => {
              bookmark_list.splice(i, 1);
              store.set('bookmark', bookmark_list);
            }
          }
        ]
      });

      menuItem.submenu.insert(0, bookmarkItem);
    }

    more_button_context.append(menuItem);
  }
  else{
    let menuItem = new electron.MenuItem({
      label: 'ブックマーク',
      submenu: [
        {
          label: 'ブックマークがありません',
          enabled: false
        }
      ]
    });

    more_button_context.append(menuItem);
  }

  more_button_context.popup();
});

electron.ipcMain.handle('reload', (event, data) => {
  // bv[open_tab].webContents.reload();
  // setTitle(open_tab);
  tab.setTitle(open_tab);
  tab.reload();
});

electron.ipcMain.handle('searchURL', (event, word) => {
  let url;

  if (word.slice(0, 4) === 'http') {
    url = `${word}`;
  } else if(word.slice(0, 4) === 'file') {
    url = `${word}`;
  } else if(word.slice(0, 5) === 'flune') {
    url = `${word}`;
  } else if(word.slice(0, 5) === 'about') {
    url = `${word}`;
  } else if (word.match(/\S+\.\S+/)) {
    url = `http://${word}`;
  } else {
    let setting = store.get('settings', {
      "settings": {
        "force_twemoji": false,
        "theme": "theme_dark",
        "search_engine": "google"
      }
    });
    if(setting.search_engine === 'google'){
      url = `https://www.google.com/search?q=${word}`;
    } else if(setting.search_engine === 'yahoo_japan'){
      url = `https://search.yahoo.co.jp/search?p=${word}`;
    } else if((setting.search_engine === 'ddg')){
      url = `https://duckduckgo.com/?q=${word}`;
    } else if(setting.search_engine === 'frea_search'){
      url = `https://freasearch.org/search?q=${word}`;
    } else {
      url = `https://www.google.com/search?q=${word}`;
    }
    
  }

  // bv[open_tab].webContents.loadURL(url);
  tab.loadURL(url);

  // win.webContents.send('change_url', {
  //   url: bv[open_tab].webContents.getURL()
  // });

  removeSuggestView();
});

function removeSuggestView() {
  if(suggestView){
    win.removeBrowserView(suggestView);
    suggestDisplayed = false;
  }
}

let recentSuggest;

electron.ipcMain.handle('getRecentSuggest', async (event, data) => {
  return recentSuggest;
});

let suggestDisplayed;

electron.ipcMain.handle('viewSuggest', async (event, data) => {
  suggestDisplayed = true;

  let result;

  result = [];

  if(data.word.trim() === ''){
    win.removeBrowserView(suggestView);
    return;
  }

  request({
    url: `https://www.google.com/complete/search?output=toolbar&q=${encodeURI(data.word)}`,
	  method: 'GET'
  }, (error, response, body) => {
    let suggestXml = body;

    // if(suggestDisplayed && suggestView){
    //   win.removeBrowserView(suggestView);
    //   suggestView.webContents.destroy();
    //   suggestView = null;
    // }

    xml2js.parseString(suggestXml, function (err, res) {
      if (err) {
        console.error(err.message);
      } else {
        if(res.toplevel){
          res.toplevel.CompleteSuggestion.forEach((val, index) => {
            result[result.length] = val.suggestion[0]['$'].data;
          });
        }
      }

      if(result.length === 0) return;

      recentSuggest = {
        word: data.word,
        result
      }

      data.pos[0] = Math.floor(data.pos[0]);
      data.pos[1] = Math.floor(data.pos[1]);

      win.addBrowserView(suggestView);
      suggestView.webContents.loadFile(`${__dirname}/src/views/suggest.html`);
      suggestView.setBounds({x: data.pos[0], y: data.pos[1], width: 500, height: 260});
      win.setTopBrowserView(suggestView);
    });
  });
});

electron.ipcMain.handle('closeSuggest', (event, data) => {
  win.removeBrowserView(suggestView);
  suggestDisplayed = false;
});

electron.ipcMain.handle('toggle_setting', (event, word) => {
  // if(!setting_win){
  //   ns();
  // }
  // else{
  //   setting_win.close();
  //   setting_win = null;
  // }
  ns();
});

electron.ipcMain.handle('save_setting', (event, data) => {
  store.set('settings', data);
  win.webContents.send('change_theme');
  // tab.reload();
});

electron.ipcMain.handle('get_setting', (event, data) => {
  return store.get('settings', {
    "settings": {
      "force_twemoji": false,
      "auto_theme": false,
      "theme": "theme_dark",
      "search_engine": "google"
    }
  });
});

electron.ipcMain.handle('addBookmark', (event, data) => {
  let bookmark_list = store.get('bookmark', []);

  if(bookmark_list.length >= 1){
    for (let i = 0; i < bookmark_list.length; i++) {
      if(bookmark_list[i].url !== tab.getURL()){
        if(i <= bookmark_list.length){
          bookmark_list[bookmark_list.length] = {
            url: tab.getURL(),
            title: tab.getTitle()
          };
          store.set('bookmark', bookmark_list);
          break;
        }
      }
      else{
        console.debug(bookmark_list[i].url, tab.getURL());
      }
    }
  }
  else{
    bookmark_list[bookmark_list.length] = {
      url: tab.getURL(),
      title: tab.getTitle()
    };
    store.set('bookmark', bookmark_list);
  }
});

electron.ipcMain.handle('removeBookmark', (event, data) => {
  let bookmark_list = store.get('bookmark', []);
  
  for (let i = 0; i < bookmark_list.length; i++) {
    if(bookmark_list[i].url === tab.getURL()){
      bookmark_list.splice(i, 1);
      store.set('bookmark', bookmark_list);
      break;
    }
    else{
      console.debug(bookmark_list[i].url, tab.getURL());
    }
  }
});

electron.ipcMain.handle('copy', (event, data) => {
  electron.clipboard.writeText(data);
});

electron.ipcMain.handle('close', (event, data) => {
  win.close();
  win = null;

  if(setting_win){
    setting_win.close();
    setting_win = null;
  }
});

electron.ipcMain.handle('hide_win', (event, data) => {
  win.minimize();
});

electron.ipcMain.handle('maxmin_win', (event, data) => {
  win.isMaximized() ? win.unmaximize() : win.maximize();
});

const context_menu = electron.Menu.buildFromTemplate([
  {
    label: '戻る',
    click: () => {
      tab.goBack();
    }
  },
  {
    label: '進む',
    click: () => {
      tab.goForward();
    }
  },
  {
    type: 'separator'
  },
  {
    label: 'コピー',
    accelerator: 'CmdOrCtrl+C',
    click: () => {
      tab.bv[tab.open_tab].webContents.send('copy_selection');
    }
  },
  {
    label: 'ペースト',
    role: 'paste'
  },
  {
    label:'切り取り',
    role:'cut'
  },
  {
    type: 'separator'
  },
  {
    label:'再読み込み',
    accelerator: 'CmdOrCtrl+R',
    click: () => {
      tab.bv[tab.open_tab].webContents.reload();
    }
  },
  {
    label:'強制的に再読み込み',
      accelerator: 'CmdOrCtrl+Shift+R',
      click: () => {
        tab.bv[tab.open_tab].webContents.reloadIgnoringCache();
    }
  },
  {
    accelerator: 'F12',
    click: () => {
      tab.bv[tab.open_tab].webContents.toggleDevTools();
    }, label:'開発者ツールを表示'
  }
]);

electron.ipcMain.handle('move_home', (event, data) => {
  tab.loadURL(`file://${__dirname}/src/views/home.html`);
});

const context_menu_nav = electron.Menu.buildFromTemplate([
  {
    label: 'バグ報告',
    click: () => {
      electron.shell.openExternal('https://github.com/mf-3d/flune-browser/issues');
    }
  },
  {
    type: 'separator'
  },
  {
    label: '設定',
    click: () => {
      // if(!setting_win){
      //   ns();
      // }
      // else{
      //   setting_win.close();
      //   setting_win = null;
      // }
      ns();
    }
  }
]);

// メニューを適用する
// tab.js

module.exports = {
  tab: tab,
  win: win,
  dirname: __dirname
}