// モジュール読み込み
const { app } = require("electron");
const electron = require("electron");
const Store = require('electron-store');
const log = require('electron-log');
const request = require('request');
const os = require('os');
const xml2js = require("xml2js");
const touchBar = require('./main/touchBar.js');
const applicationMenu = require('./main/applicationMenu.js');
const setProtocol = require('./main/protocol');
const appSync = require('./main/sync');

// ログ関連
console.log = log.log;
console.debug = log.debug;
console.log(`\x1b[48;2;58;106;194m\x1b[38;2;255;255;255m INFO \x1b[0m Flune-Browserを起動中です...`);

process.on('uncaughtException', (err) => {
  log.error(err); // ログファイルへ記録
  console.log('\x1b[41m\x1b[37mAn error has occurred.\x1b[0m');
  let index = electron.dialog.showMessageBoxSync(null, {
    type: 'error',
    icon: './src/icon.png',
    title: 'Flune-Browserでエラーが発生しました。',
    message: 'Flune-Browserでエラーが発生しました。',
    detail: `アプリで予期しないエラーが発生しました。
    アプリを終了しますか？\n\n
    (Error):${err.message}`,
    buttons: ['アプリを終了する', 'アプリを終了せずに続ける(非推奨)'],
    defaultId: 0
  });

  if(index === 0){
    app.quit();
  }
});

const store = new Store();
const browserSync = new appSync(store.get('syncAccount.user', null), store.get('syncAccount.password', null));

let win;
let setting_win;
let suggestView;
let bv = [];
let timer = [];
let winSize;
let open_tab = 1;

let viewY = 50;
// let viewY = 200;

const isMac = (process.platform === 'darwin');

function nt(url) {
  let id = bv.length;

  bv[bv.length] = new electron.BrowserView({
    transparent: false,
    backgroundColor: '#ffffff',
    webPreferences: {
      scrollBounce: true,
      worldSafeExecuteJavaScript: true,
      nodeIntegration:false,
      contextIsolation: true,
      preload: `${__dirname}/preload/preload_browserview.js`
    }
  });
 
  if(url){
    bv[bv.length - 1].webContents.loadURL(url);
  }
  else{
    bv[bv.length - 1].webContents.loadURL("file://" + __dirname + "/src/views/home.html");
  }

  bv[bv.length - 1].webContents.setVisualZoomLevelLimits(1, 5);

  win.addBrowserView(bv[bv.length - 1]);

  bv[bv.length - 1].setBounds({x: 0, y: viewY, width: winSize[0], height: winSize[1]-viewY});

  win.setTopBrowserView(bv[bv.length - 1]);

  bv[id].setAutoResize({width: true, height: true});

  open_tab = bv.length - 1;

  bv[id].webContents.on('did-start-loading', () => {
    win.webContents.send('update-loading', {
      index: id,
      loading: true
    });
  });

  bv[id].webContents.on('did-stop-loading', () => {
    win.webContents.send('update-loading', {
      index: id,
      loading: false
    });
  });

  bv[id].webContents.on('media-started-playing', () => {
    if(!timer[id]){
      timer[id] = setInterval(() => {
        if(bv[id]){
          win.webContents.send('update-audible', {
            index: id,
            audible: bv[id].webContents.isCurrentlyAudible()
          });
        }
    
        // console.log('音声が再生されているかどうか:', bv[id].webContents.isCurrentlyAudible());
      }, 1000);

      console.log(`\x1b[48;2;58;106;194m\x1b[38;2;255;255;255m INFO \x1b[0m 更新用タイマーが生成されました`);
    }
  });

  bv[id].webContents.on('destroyed', () => {
    clearInterval(timer[id]);
    timer[id] = null;

    console.log(`\x1b[48;2;58;106;194m\x1b[38;2;255;255;255m INFO \x1b[0m webContentsが破棄されたため更新用タイマーが消去されました`);
  });

  bv[id].webContents.on('media-paused', () => {
    if(timer[id]){
      clearInterval(timer[id]);
      timer[id] = null;

      try {
        win.webContents.send('update-audible', {
          index: id,
          audible: false
        });
      } catch (e) {

      }

      console.log(`\x1b[48;2;58;106;194m\x1b[38;2;255;255;255m INFO \x1b[0m メディア再生が停止したため更新用タイマーが消去されました`);
    }
  });

  bv[id].webContents.setWindowOpenHandler((details) => {
    win.webContents.send('new_tab_elm', {});
    nt(details.url);
    console.log(`\x1b[48;2;58;106;194m\x1b[38;2;255;255;255m INFO \x1b[0m 新しいタブがsetWindowOpenHandlerによって生成されました`);
    return { action: 'deny' };
  });

  bv[id].webContents.on('did-finish-load', () => {
    let bookmark_list = store.get('bookmark', []);

    if(store.get('settings.theme', 'theme_dark') === 'theme_dark'){
      electron.nativeTheme.themeSource = 'dark';
    }
    else{
      electron.nativeTheme.themeSource = 'light';
    }
  
    for (let i = 0; i < bookmark_list.length; i++) {
      if(bookmark_list[i].url === bv[open_tab].webContents.getURL()){
        win.webContents.send('activeBookmark', true);
        break;
      }
      else{
        win.webContents.send('activeBookmark', false);
      }
    }
  });

  win.webContents.send('change-favicon', {
    index: id,
    favicon: ''
  });

  ot(id);
}

function ot(index) {
  open_tab = index;
  electron.Menu.setApplicationMenu(applicationMenu.application_menu(app, win, bv, open_tab));
  win.setTopBrowserView(bv[index]);
  // win.setTopBrowserView(circle_dock);
  bv[index].webContents.removeAllListeners('did-start-loading');
  bv[index].webContents.removeAllListeners('did-finish-load');
  bv[index].webContents.removeAllListeners('page-favicon-updated');
  bv[index].webContents.removeAllListeners('page-title-updated');
  bv[index].webContents.removeAllListeners('did-stop-loading');
  bv[index].webContents.removeAllListeners('destroyed');
  bv[index].webContents.removeAllListeners('media-started-playing');
  bv[index].webContents.removeAllListeners('media-paused');
  bv[index].webContents.removeAllListeners('context-menu');
  bv[index].webContents.removeAllListeners('did-fail-load');
  bv[index].webContents.session.removeAllListeners('will-download');
  console.log(`\x1b[48;2;58;106;194m\x1b[38;2;255;255;255m INFO \x1b[0m タブ${index}のEventListenerを再設定するために全て削除しました`);

  bv[index].webContents.on('did-start-loading', () => {
    win.webContents.send('update-loading', {
      index: index,
      loading: true
    });

    if(store.get('settings.theme', 'theme_dark') === 'theme_light'){
      bv[index].setBackgroundColor('#fafafa');
    }
    else{
      bv[index].setBackgroundColor('#252525');
    }
  });

  bv[index].webContents.on('did-stop-loading', () => {
    win.webContents.send('update-loading', {
      index: index,
      loading: false
    });
  });

  bv[index].webContents.on('media-started-playing', () => {
    win.webContents.send('each');
    if(!timer[index]){
      clearInterval(timer[index]);
      timer[index] = null;
      timer[index] = setInterval(() => {
        if(bv[index]){
          win.webContents.send('update-audible', {
            index: index,
            audible: bv[index].webContents.isCurrentlyAudible()
          });
        }
    
        // console.log('音声が再生されているかどうか:', bv[index].webContents.isCurrentlyAudible());
      }, 1000);

      console.log(`\x1b[48;2;58;106;194m\x1b[38;2;255;255;255m INFO \x1b[0m 更新用タイマーが生成されました`);
    }
  });

  bv[index].webContents.on('destroyed', () => {
    if(timer[index]){
      clearInterval(timer[index]);
      timer[index] = null;
      console.log(`\x1b[48;2;58;106;194m\x1b[38;2;255;255;255m INFO \x1b[0m webContentsが破棄されたため更新用タイマーが消去されました`);
    }
  });

  bv[index].webContents.on('media-paused', () => {
    try {
      win.webContents.send('each');
      if(timer[index]){
        clearInterval(timer[index]);
        timer[index] = null;
        win.webContents.send('update-audible', {
          index: index,
          audible: false
        });

        console.log(`\x1b[48;2;58;106;194m\x1b[38;2;255;255;255m INFO \x1b[0m メディア再生が停止したため更新用タイマーが消去されました`);
      }
    } catch (e) {

    }
  });

  bv[index].webContents.on('page-favicon-updated', (event, favicons) => {
    bv[index].setBackgroundColor('#ffffff');
    console.debug(favicons[0]);
    win.webContents.send('change-favicon', {
      index,
      favicon: favicons[0]
    });
  });

  bv[index].webContents.on('page-title-updated', () => {
    bv[index].setBackgroundColor('#ffffff');
    if(bv[index]){
      console.log(`\x1b[48;2;58;106;194m\x1b[38;2;255;255;255m INFO \x1b[0m setTitleに${index}の更新を要求しました 現在のタブ数: ${bv.length}`);
      setTitle(index);
    }
    else if(bv[index - 1]){
      console.log(`\x1b[48;2;58;106;194m\x1b[38;2;255;255;255m INFO \x1b[0m setTitleに${index - 1}の更新を要求しました 現在のタブ数: ${bv.length}`);
      setTitle(index - 1);
    }
    else if(bv[index + 1]){
      console.log(`\x1b[48;2;58;106;194m\x1b[38;2;255;255;255m INFO \x1b[0m setTitleに${index + 1}の更新を要求しました 現在のタブ数: ${bv.length}`);
      setTitle(index + 1);
    }
    else{
      console.log(`\x1b[48;2;58;106;194m\x1b[38;2;255;255;255m INFO \x1b[0m setTitleに${index}の更新を要求しました 現在のタブ数: ${bv.length}`);
      setTitle(index);
    }
  });

  bv[index].webContents.on('context-menu', (event, params) => {
    event.preventDefault();

    const context_menu = applicationMenu.context_menu(bv, open_tab, params).context_menu;
    const context_menu_link_image = applicationMenu.context_menu(bv, open_tab, params).context_menu_link_image;
    const context_menu_link = applicationMenu.context_menu(bv, open_tab, params).context_menu_link_image;
    const context_menu_link_text = applicationMenu.context_menu(bv, open_tab, params).context_menu_link_text;
    const context_menu_text = applicationMenu.context_menu(bv, open_tab, params).context_menu_text;
    const context_menu_img = applicationMenu.context_menu(bv, open_tab, params).context_menu_img;

    setTitle(index);

    if(params.hasImageContents && params.linkURL){
      context_menu_link_image.popup();
    }
    else if(params.linkURL && params.selectionText){
      context_menu_link_text.popup();
    }
    else if(params.mediaType === 'image'){
      context_menu_img.popup();
    } 
    else if(params.linkURL){
      context_menu_link.popup();
    }
    else if(params.selectionText !== '' && params.selectionText){
      context_menu_text.popup();
    }
    else{
      context_menu.popup();
    }
  });

  // bv[index].webContents.on('new-window', (event, url) => {
  //   event.preventDefault();
  //   win.webContents.send('new_tab_elm', {});
  //   nt(url);
  // });

  bv[index].webContents.setWindowOpenHandler((details) => {
    win.webContents.send('new_tab_elm', {});
    nt(details.url);
    return { action: 'deny' };
  });

  bv[index].webContents.on('did-fail-load', (event, errCode) => {
    if (errCode === -105){
      bv[index].webContents.loadFile(`${__dirname}/src/views/err/server_notfound.html`);
    } else if(errCode === -106){
      bv[index].webContents.loadFile(`${__dirname}/src/views/err/internet_disconnected.html`);
    } else if(errCode === -118){
      bv[index].webContents.loadFile(`${__dirname}/src/views/err/connection_timed_out.html`);
    } else if(errCode === -3){
      // なにもしない
    } else {
      bv[index].webContents.loadFile(`${__dirname}/src/views/err/unknown_err.html`);
      console.debug(`ページ表示エラー(未定義):${errCode}`)
    }
  });

  bv[index].webContents.on('did-finish-load', () => {
    bv[index].setBackgroundColor('#ffffff');
    let bookmark_list = store.get('bookmark', []);

    if(store.get('settings.theme', 'theme_dark') === 'theme_dark'){
      electron.nativeTheme.themeSource = 'dark';
    }
    else{
      electron.nativeTheme.themeSource = 'light';
    }
  
    for (let i = 0; i < bookmark_list.length; i++) {
      if(bookmark_list[i].url === bv[open_tab].webContents.getURL()){
        win.webContents.send('activeBookmark', true);
        break;
      }
      else{
        win.webContents.send('activeBookmark', false);
      }
    }
  });

  bv[index].webContents.session.on('will-download', (event, item, webContents) => {
    win.webContents.send('update-downloading', {
      name: item.getFilename(),
      index: index,
      downloading: true
    });

    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed');
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused');
          win.webContents.send('update-downloading', {
            name: item.getFilename(),
            index: index,
            downloading: false
          });
        } else {
          // console.log(`Received bytes: ${item.getReceivedBytes()}`);
          win.webContents.send('update-downloading', {
            name: item.getFilename(),
            index: index,
            downloading: true
          });
        }
      }
    })
    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log('Download successfully');
        win.webContents.send('update-downloading', {
          name: item.getFilename(),
          index: index,
          downloading: false
        });

        console.debug(bv[index].webContents.getURL());
        if(bv[index].webContents.getURL() === ''){
          win.webContents.send('remove_tab_elm', {index});
          close_tab(index);
        }
      } else {
        console.log(`Download failed: ${state}`);
        win.webContents.send('update-downloading', {
          name: item.getFilename(),
          index: index,
          downloading: false
        });

        console.debug(bv[index].webContents.getURL());
        if(bv[index].webContents.getURL() === ''){
          win.webContents.send('remove_tab_elm', {index});
          close_tab(index);
        }
      }
    });
  });

  if(bv[index].webContents){
    setTitle(index);
  }
}

function setTitle(index) {
  console.debug('SetTitleで受け取ったindex:', index);
  if(index > bv.length - 1){
    index = bv.length - 1;
  }

  win.webContents.send('each');

  let url;

  try{
    url = new URL(bv[index].webContents.getURL());
  } catch (e) {
    url = bv[index].webContents.getURL();
  }
  if(String(url) === String(new URL("file://" + __dirname + "/src/views/home.html")) || String(url) === String(new URL("file://" + __dirname + "/src/views/server_notfound.html"))){
    url = "";
  }

  let bookmark_list = store.get('bookmark', []);
  
  for (let i = 0; i < bookmark_list.length; i++) {
    if(bookmark_list[i].url === bv[open_tab].webContents.getURL()){
      win.webContents.send('activeBookmark', true);
      break;
    }
    else{
      win.webContents.send('activeBookmark', false);
    }
  }

  win.webContents.send('change_title', {
    title: bv[index].webContents.getTitle(),
    index: index
  });

  if(open_tab === index){
    win.webContents.send('change_url', {
      url: new String(url)
    });
  }
}

function ns() {
  // setting_win = new electron.BrowserWindow({
  //   width: 600, height: 400, minWidth: 600, minHeight: 400,
  //   transparent: false,
  //   backgroundColor: '#ffffff',
  //   title: 'Flune-Browser 2.0.0',
  //   // icon: `${__dirname}/src/image/logo.png`,
  //   webPreferences: {
  //     worldSafeExecuteJavaScript: true,
  //     nodeIntegration:false,
  //     contextIsolation: true,
  //     preload: `${__dirname}/preload/preload.js`
  //   }
  // });

  // setting_win.loadFile(`${__dirname}/src/views/setting.html`);

  // setting_win.on('closed', () => {
  //   setting_win = null;
  // });

  bv[open_tab].webContents.loadURL('flune://setting');
}

function nw() {
  if(process.platform === 'darwin'){
    log_path = os.homedir() + '/Library/Logs/flune-browser/';
    console.log('ログの保存場所:', os.homedir() + '/Library/Logs/flune-browser/');
  }
  else if(process.platform === 'win32'){
    log_path = os.homedir() + '/AppData/Roaming/flune-browser/logs/';
    console.log('ログの保存場所:', os.homedir() + '/AppData/Roaming/flune-browser/logs/');
  }


  let db_winSize = store.get('window.window_size', [1200, 700]);
  if(isMac){
    win = new electron.BrowserWindow({
      width: db_winSize[0], height: db_winSize[1], minWidth: 600, minHeight: 400,
      frame: false,
      transparent: false,
      backgroundColor: '#ffffff',
      title: 'Flune-Browser 2.3.0',
      titleBarStyle: 'hidden',
      // icon: `${__dirname}/src/image/logo.png`,
      webPreferences: {
        worldSafeExecuteJavaScript: true,
        nodeIntegration:false,
        contextIsolation: true,
        preload: `${__dirname}/preload/preload.js`
      }
    });

    win.loadFile(`${__dirname}/src/views/menu.html`);
    // win.loadFile(`${__dirname}/src/views/notification.html`);

    win.setTouchBar(touchBar);
  }
  else{
    win = new electron.BrowserWindow({
      width: db_winSize[0], height: db_winSize[1], minWidth: 600, minHeight: 400,
      frame: false,
      transparent: false,
      backgroundColor: '#ffffff',
      title: 'Flune-Browser 2.3.0',
      // icon: `${__dirname}/src/image/logo.png`,
      webPreferences: {
        worldSafeExecuteJavaScript: true,
        nodeIntegration:false,
        contextIsolation: true,
        preload: `${__dirname}/preload/preload.js`
      }
    });
    win.loadFile(`${__dirname}/src/views/menu_win.html`);
  }

  winSize = win.getSize();

  // toggleCircleDock();
  nt();

  bv[open_tab].webContents.on('did-finish-load', () => {
    // win.webContents.openDevTools();
  });

  electron.session.defaultSession.loadExtension(__dirname + '/Extension/gebbhagfogifgggkldgodflihgfeippi').then(({ id, manifest, url }) => {
    // win.webContents.loadURL('chrome-extension://gebbhagfogifgggkldgodflihgfeippi/popup.html');
    win.webContent.send('addExtension', {
      id, manifest, url: `${url}${manifest.action.default_popup}`
    });
  });

  win.on('resize', () => {
    winSize = win.getSize();
  });

  win.on('close', () => {
    store.set('window.window_size', winSize);

    for(let index = 0; index < bv.length - 1; index++){
      bv[index].webContents.removeAllListeners();
      bv[index].webContents.destroy();
      bv[index] = null;
      bv.splice(index, 1);
      clearInterval(timer[index]);
    }

    bv = [];

    win.webContents.destroy();
  });

  win.on('closed', () => {
    win = null;
  });
}

electron.app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
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
    app.dock.setMenu(dockMenu);
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
  nt();
});

function close_tab(index) {
  clearInterval(timer[index]);
  timer[index] = null;
  timer.splice(index, 1);

  bv[index].webContents.removeAllListeners();
  win.removeBrowserView(bv[index]);
  console.debug(index);
  bv[index].webContents.destroy();

  bv.splice(index, 1);

  if(index === 0 && bv.length !== 0){
    index = index;
  }
  else{
    index = index - 1;
  }

  if(bv.length === 0){
    win.close();
  } 

  console.debug('close_tabイベントで受け取ったindex:', index);

  if(bv.length - 1 > 0){
    win.webContents.send('each');

    ot(index);

    open_tab = index;

    win.webContents.send('active_tab', {
      index
    });
  }
}

electron.ipcMain.handle('close_tab', (event, index) => {
  close_tab(index);
});

electron.ipcMain.handle('open_tab', (event, index) => {
  ot(index);

  win.webContents.send('each');

  removeSuggestView();
});

electron.app.on('certificate-error', function(event, webContents, url, error, certificate, callback) {
  event.preventDefault();
  electron.dialog.showMessageBox(win, {
    title: 'Certificate error',
    message: `Do you trust certificate from "${certificate.issuerName}"?`,
    detail: `URL: ${url}\nError: ${error}`,
    type: 'warning',
    buttons: [
      'Yes',
      'No'
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
    if(store.get('settings').theme === 'theme_dark'){
      theme = '../style/theme/dark_theme.css';
    }
    else if(store.get('settings').theme === 'theme_light'){
      theme = '../style/theme/light_theme.css';
    }
    else if(store.get('settings').theme === 'elemental_theme_light'){
      theme = '../style/theme/light_elemental_theme.css';
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
  bv[open_tab].webContents.goBack();
  setTitle(open_tab);
});

electron.ipcMain.handle('go_forward', (event, data) => {
  bv[open_tab].webContents.goForward();
  setTitle(open_tab);
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
        nt();
        electron.clipboard.writeImage(electron.nativeImage.createFromDataURL(data));
      }
    }
  ]);

  context_menu_img.popup();
});

electron.ipcMain.handle('login', (event, data) => {
  console.log(data);
  // browserSync = new appSync(data.submit_id[0], data.submit_id[1]);
});

electron.ipcMain.handle('more_button_menu', (event, data) => {
  let more_button_context = new electron.Menu([
    {
      label: '新しいタブ',
      click: () => {
        nt();
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
      let login_win = new electron.BrowserWindow({
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
        width: 600,
        height: 800
      });

      login_win.webContents.loadFile(`${__dirname}/src/views/login.html`);
    }
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
        click: () => {
          bv[open_tab].webContents.loadURL(bookmark_list[i].url);
        }
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
  bv[open_tab].webContents.reload();
  setTitle(open_tab);
});

electron.ipcMain.handle('searchURL', (event, word) => {
  let url;

  if (word.slice(0, 4) === 'http') {
    url = `${word}`;
  } else if(word.slice(0, 4) === 'file') {
    url = `${word}`;
  } else if(word.slice(0, 5) === 'flune') {
    url = `${word}`;
  } else if (word.match(/\S+\.\S+/)) {
    url = `http://${word}`;
  } else {
    url = "https://www.google.com/search?q=" + word;
  }

  bv[open_tab].webContents.loadURL(url);

  win.webContents.send('change_url', {
    url: bv[open_tab].webContents.getURL()
  });

  removeSuggestView();
});

function removeSuggestView() {
  if(suggestView){
    win.removeBrowserView(suggestView);
    suggestView.webContents.destroy();
    suggestView = null;
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

  if(!data.word){
    win.removeBrowserView(suggestView);
    suggestView.webContents.destroy();
    suggestView = null;
  }

  request({
    url: `https://www.google.com/complete/search?output=toolbar&q=${encodeURI(data.word)}`,
	  method: 'GET'
  }, (error, response, body) => {
    let suggestXml = body;

    if(suggestDisplayed && suggestView){
      win.removeBrowserView(suggestView);
      suggestView.webContents.destroy();
      suggestView = null;
    }

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

      suggestView = new electron.BrowserView({
        transparent: true,
        backgroundColor: '#ffffff',
        webPreferences: {
          scrollBounce: true,
          worldSafeExecuteJavaScript: true,
          nodeIntegration:false,
          contextIsolation: true,
          preload: `${__dirname}/preload/preload_suggest.js`
        }
      });

      data.pos[0] = Math.floor(data.pos[0]);
      data.pos[1] = Math.floor(data.pos[1]);

      suggestView.webContents.loadFile(`${__dirname}/src/views/suggest.html`);
      win.addBrowserView(suggestView);
      suggestView.setBounds({x: data.pos[0], y: data.pos[1], width: 500, height: 260});
      win.setTopBrowserView(suggestView);
    
      // suggestView.webContents.on('blur', () => {
      //   win.removeBrowserView(suggestView);
      //   suggestView.webContents.destroy();
      //   suggestView = null;
      //   suggestDisplayed = false;
      // });
    });
  });
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
  bv[open_tab].webContents.reload();
});

electron.ipcMain.handle('get_setting', (event, data) => {
  return store.get('settings', {
    "settings": {
      "force_twemoji": false,
      "auto_theme": false,
      "theme": "theme_dark"
    }
  });
});

electron.ipcMain.handle('addBookmark', (event, data) => {
  let bookmark_list = store.get('bookmark', []);

  if(bookmark_list.length >= 1){
    for (let i = 0; i < bookmark_list.length; i++) {
      if(bookmark_list[i].url !== bv[open_tab].webContents.getURL()){
        if(i <= bookmark_list.length){
          bookmark_list[bookmark_list.length] = {
            url: bv[open_tab].webContents.getURL(),
            title: bv[open_tab].webContents.getTitle()
          };
          store.set('bookmark', bookmark_list);
          break;
        }
      }
      else{
        console.debug(bookmark_list[i].url, bv[open_tab].webContents.getURL());
      }
    }
  }
  else{
    bookmark_list[bookmark_list.length] = {
      url: bv[open_tab].webContents.getURL()
    };
    store.set('bookmark', bookmark_list);
  }
});

electron.ipcMain.handle('removeBookmark', (event, data) => {
  let bookmark_list = store.get('bookmark', []);
  
  for (let i = 0; i < bookmark_list.length; i++) {
    if(bookmark_list[i].url === bv[open_tab].webContents.getURL()){
      bookmark_list.splice(i, 1);
      store.set('bookmark', bookmark_list);
      break;
    }
    else{
      console.debug(bookmark_list[i].url, bv[open_tab].webContents.getURL());
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
      bv[open_tab].webContents.goBack();
    }
  },
  {
    label: '進む',
    click: () => {
      bv[open_tab].webContents.goForward();
    }
  },
  {
    type: 'separator'
  },
  {
    label: 'コピー',
    accelerator: 'CmdOrCtrl+C',
    click: () => {
      bv[open_tab].webContents.send('copy_selection');
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
      bv[open_tab].webContents.reload();
    }
  },
  {
    label:'強制的に再読み込み',
      accelerator: 'CmdOrCtrl+Shift+R',
      click: () => {
      bv[open_tab].webContents.reloadIgnoringCache();
    }
  },
  {
    accelerator: 'F12',
    click: () => {
      bv[open_tab].webContents.toggleDevTools();
    }, label:'開発者ツールを表示'
  }
]);

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
      if(!setting_win){
        ns();
      }
      else{
        setting_win.close();
        setting_win = null;
      }
    }
  }
]);

// メニューを適用する
electron.Menu.setApplicationMenu(applicationMenu.application_menu(app, win, bv, open_tab));