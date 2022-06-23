const { app } = require("electron");
const electron = require("electron");
const Store = require('electron-store');
const log = require('electron-log');
const fs = require('fs');
const request = require('request');
// require('update-electron-app')({
//   repo: 'mf-3d/Flune-Browser',
//   updateInterval: '5 minutes'
// });

console.log = log.log;
console.debug = log.debug;

process.on('uncaughtException', (err) => {
  log.error(err); // ログファイルへ記録
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

let win;
let setting_win;
let bv = [];
let timer = [];
let winSize;
let open_tab = 1;

let app_name = "Flune-Browser";

let viewY = 50;
// let viewY = 200;

const isMac = (process.platform === 'darwin');

function nt(url) {
  let id = bv.length;
  console.debug('ID:',id);

  bv[bv.length] = new electron.BrowserView({
    transparent: false,
    backgroundColor: '#ffffff',
    webPreferences: {
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

  win.addBrowserView(bv[bv.length - 1]);

  bv[bv.length - 1].setBounds({x: 0, y: viewY, width: winSize[0], height: winSize[1]-viewY});

  win.setTopBrowserView(bv[bv.length - 1]);


  bv[id].setAutoResize({width: true, height: true});

  open_tab = bv.length - 1;

  bv[id].webContents.on('context-menu', (event, params) => {
    event.preventDefault();

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
          if(params.mediaType === 'image'){
            // electron.clipboard.writeImage(electron.nativeImage.createFromDataURL(params.srcURL));
            electron.webContents.getFocusedWebContents().copyImageAt(params.x, params.y);
            console.debug('クリップボードに画像がコピーされました。\n画像URL:', params.srcURL);
          } else {
            electron.clipboard.writeText(params.selectionText, 'clipboard');
          }
        }
      },
      {
        label: 'ペースト',
        click: () => {
          electron.webContents.getFocusedWebContents().paste();
        }
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

    const context_menu_img = electron.Menu.buildFromTemplate([
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
        label: '画像をコピー',
        accelerator: 'CmdOrCtrl+C',
        click: () => {
          if(params.mediaType === 'image'){
            // electron.clipboard.writeImage(electron.nativeImage.createFromDataURL(params.srcURL));
            electron.webContents.getFocusedWebContents().copyImageAt(params.x, params.y);
            console.debug('クリップボードに画像がコピーされました。\n画像URL:', params.srcURL);
          } else {
            electron.clipboard.writeText(params.selectionText, 'clipboard');
          }
        }
      },
      {
        label: '画像を保存',
        click: () => {
          if(params.mediaType === 'image'){
            // electron.clipboard.writeImage(electron.nativeImage.createFromDataURL(params.srcURL));
            electron.webContents.getFocusedWebContents().copyImageAt(params.x, params.y);
      
            let path = electron.dialog.showSaveDialogSync(null, {
              title: '画像を保存',
              properties: ['createDirectory'],
              filters: [
                {
                  name: '画像',
                  extensions: ['jpg','png','gif','webp']
                }
              ]
            });

            if(path !== undefined){
              request(
                  {method: 'GET', url: params.srcURL, encoding: null},
                  (error, response, body) => {
                      if(!error && response.statusCode === 200){
                        console.debug('画像が保存されました。\n画像URL:', params.srcURL, '\n保存先:', path);
                          fs.writeFileSync(path, body, 'binary');
                      }
                  }
              );
            }
          } else {
            electron.clipboard.writeText(params.selectionText, 'clipboard');
          }
        }
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

    if(params.mediaType === 'image'){
      context_menu_img.popup();
    }
    else{
      context_menu.popup();
    }
  });

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
    win.webContents.send('each');
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

      console.log('タイマーが生成されました。');
    }
  });

  bv[id].webContents.on('destroyed', () => {
    if(timer[id]){
      clearInterval(timer[id]);
      timer[id] = null;
    }
  });

  bv[id].webContents.on('media-paused', () => {
    win.webContents.send('each');
    if(timer[id]){
      clearInterval(timer[id]);
      timer[id] = null;
      win.webContents.send('update-audible', {
        index: id,
        audible: false
      });

      console.log('タイマーが消去されました。');
    }
  });

  bv[id].webContents.setWindowOpenHandler((details) => {
    win.webContents.send('new_tab_elm', {});
    nt(details.url);
    return { action: 'deny' };
  });

  bv[id].webContents.on('did-fail-load', () => {
    bv[id].webContents.loadFile(`${__dirname}/src/views/server_notfound.html`);
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

  ot(id);
}

function ot(index) {
  open_tab = index;
  win.setTopBrowserView(bv[index]);

  console.debug(index);

  bv[index].webContents.on('did-start-loading', () => {
    win.webContents.send('update-loading', {
      index: index,
      loading: true
    });
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
      timer[index] = setInterval(() => {
        if(bv[index]){
          win.webContents.send('update-audible', {
            index: index,
            audible: bv[index].webContents.isCurrentlyAudible()
          });
        }
    
        // console.log('音声が再生されているかどうか:', bv[index].webContents.isCurrentlyAudible());
      }, 1000);

      console.log('タイマーが生成されました。');
    }
  });

  bv[index].webContents.on('destroyed', () => {
    win.webContents.send('each');
    if(timer[index]){
      clearInterval(timer[index]);
      timer[index] = null;
    }
  });

  bv[index].webContents.on('media-paused', () => {
    win.webContents.send('each');
    if(timer[index]){
      clearInterval(timer[index]);
      timer[index] = null;
      win.webContents.send('update-audible', {
        index: index,
        audible: false
      });

      console.log('タイマーが消去されました。');
    }
  });

  bv[index].webContents.on('page-title-updated', () => {
    if(bv[index]){
      console.debug('SetTitleに送るindex:', index);
      setTitle(index);
    }
    else if(bv[index - 1]){
      console.debug('SetTitleに送るindex:', index - 1);
      setTitle(index - 1);
    }
    else{
      console.debug('SetTitleに送るindex:', index + 1);
      setTitle(index + 1);
    }
  });

  bv[index].webContents.on('context-menu', (event, params) => {
    event.preventDefault();

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
          if(params.mediaType === 'image'){
            // electron.clipboard.writeImage(electron.nativeImage.createFromDataURL(params.srcURL));
            electron.webContents.getFocusedWebContents().copyImageAt(params.x, params.y);
            console.debug('クリップボードに画像がコピーされました。\n画像URL:', params.srcURL);
          } else {
            electron.clipboard.writeText(params.selectionText, 'clipboard');
          }
        }
      },
      {
        label: 'ペースト',
        click: () => {
          electron.webContents.getFocusedWebContents().paste();
        }
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

    const context_menu_img = electron.Menu.buildFromTemplate([
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
        label: '画像をコピー',
        accelerator: 'CmdOrCtrl+C',
        click: () => {
          if(params.mediaType === 'image'){
            // electron.clipboard.writeImage(electron.nativeImage.createFromDataURL(params.srcURL));
            electron.webContents.getFocusedWebContents().copyImageAt(params.x, params.y);
            console.debug('クリップボードに画像がコピーされました。\n画像URL:', params.srcURL);
          } else {
            electron.clipboard.writeText(params.selectionText, 'clipboard');
          }
        }
      },
      {
        label: '画像を保存',
        click: () => {
          if(params.mediaType === 'image'){
            // electron.clipboard.writeImage(electron.nativeImage.createFromDataURL(params.srcURL));
            electron.webContents.getFocusedWebContents().copyImageAt(params.x, params.y);
      
            let path = electron.dialog.showSaveDialogSync(null, {
              title: '画像を保存',
              properties: ['createDirectory'],
              filters: [
                {
                  name: '画像',
                  extensions: ['jpg','png','gif','webp']
                }
              ]
            });

            if(path !== undefined){
              request(
                  {method: 'GET', url: params.srcURL, encoding: null},
                  (error, response, body) => {
                      if(!error && response.statusCode === 200){
                        console.debug('画像が保存されました。\n画像URL:', params.srcURL, '\n保存先:', path);
                          fs.writeFileSync(path, body, 'binary');
                      }
                  }
              );
            }
          } else {
            electron.clipboard.writeText(params.selectionText, 'clipboard');
          }
        }
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

    setTitle(index);

    if(params.mediaType === 'image'){
      context_menu_img.popup();
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

  bv[index].webContents.on('did-fail-load', () => {
    bv[index].webContents.loadFile(`${__dirname}/src/views/server_notfound.html`);
  });

  bv[index].webContents.on('did-finish-load', () => {
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
}

function setTitle(index) {
  console.debug('SetTitleで受け取ったindex:', index);
  bv[index].webContents.send('each');

  bv[index].setBackgroundColor('#fafafa');
  let url = new URL(bv[index].webContents.getURL());
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
  let db_winSize = store.get('window.window_size', [1200, 700]);
  if(isMac){
    win = new electron.BrowserWindow({
      width: db_winSize[0], height: db_winSize[1], minWidth: 600, minHeight: 400,
      frame: false,
      transparent: false,
      backgroundColor: '#ffffff',
      title: 'Flune-Browser 2.0.0',
      titleBarStyle: 'hidden',
      // icon: `${__dirname}/src/image/logo.png`,
      webPreferences: {
        worldSafeExecuteJavaScript: true,
        nodeIntegration:false,
        contextIsolation: true,
        preload: `${__dirname}/preload/preload.js`
      }
    });

    // win.webContents.toggleDevTools();

    win.loadFile(`${__dirname}/src/views/menu.html`);
    // win.loadFile(`${__dirname}/src/views/notification.html`);
  }
  else{
    win = new electron.BrowserWindow({
      width: db_winSize[0], height: db_winSize[1], minWidth: 600, minHeight: 400,
      frame: false,
      transparent: false,
      backgroundColor: '#ffffff',
      title: 'Flune-Browser 2.0.0',
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

  nt();

  electron.session.defaultSession.loadExtension(__dirname + '/Extension/return-youtube-dislike').then(({ id }) => {
    // ...
  });

  electron.session.defaultSession.loadExtension(__dirname + '/Extension/looper-for-youtube').then(({ id }) => {
    // ...
  });

  win.on('resize', () => {
    winSize = win.getSize();
  });

  win.on('close', () => {
    bv.forEach((val, index) => {
      bv[index].webContents.destroy();
      bv.splice(index, 1);
    });
    store.set('window.window_size', winSize);
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

  electron.protocol.registerFileProtocol('flune', (req, callback) => {
    console.log('request URL:' + req.url);
    console.log('URL:' + req.url.slice(7));

    let url = req.url.slice(7);

    if(url === '/test'){
      electron.shell.openExternal('https://example.com');
    }
    if(url === '/setting'){
      // if(!setting_win){
      //   ns();
      // }
      // else{
      //   setting_win.close();
      //   setting_win = null;
      // }

      callback({path: `${__dirname}/src/views/setting.html`});
    }
    if(url === '/about'){
      callback({path: `${__dirname}/src/views/about.html`});
    }
    if(url === '/style/style.css'){
      callback({path: `${__dirname}/src/style/style.css`});
    }
    if(url === '/style/style_home.css'){
      callback({path: `${__dirname}/src/style/style_home.css`});
    }
    if(url === '/style/style_setting.css'){
      callback({path: `${__dirname}/src/style/style_setting.css`});
    }
    if(url === '/style/light_theme.css'){
      callback({path: `${__dirname}/src/style/light_theme.css`});
    }
    if(url === '/style/dark_theme.css'){
      callback({path: `${__dirname}/src/style/dark_theme.css`});
    }
    if(url === '/settings/background'){
      callback({path: `${__dirname}/src/views/image/lake-tahoe-bonsai-milky-way-rock-on-wallpaper.jpeg`});
    }
  });

  nw();
});


electron.ipcMain.handle('new_tab', (event, data) => {
  nt();
});

electron.ipcMain.handle('close_tab', (event, index) => {
  clearInterval(timer[index]);
  timer.splice(index, 1);
  if(bv.length === 1){
    win.removeBrowserView(bv[0]);
    bv[0].webContents.destroy();
    bv.splice(index, 1);
    win.close();

    return;
  }

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

  bv[index].webContents.send('each');

  console.debug('close_tabイベントで受け取ったindex:', index);

  ot(index);

  win.webContents.send('active_tab', {
    index: index
  });
});

electron.ipcMain.handle('open_tab', (event, index) => {
  ot(index);

  bv[index].webContents.send('each');
});

electron.app.on('certificate-error', function(event, webContents, url, error, certificate, callback) {
  event.preventDefault();
  electron.dialog.showMessageBox(mainWindow, {
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
      theme = '../style/dark_theme.css';
    }
    else if(store.get('settings').theme === 'theme_light'){
      theme = '../style/light_theme.css';
    }
  }
  catch(e){
    theme = '../style/dark_theme.css';
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
  setting_win.webContents.reload();
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

const template = electron.Menu.buildFromTemplate([
  ...(isMac ? [{
      label: app_name,
      submenu: [
        {
          label:`${app_name}について`,
          click: () => {
            electron.dialog.showMessageBox(null, {
              type: 'info',
              icon: './src/icon.png',
              title: 'Flune-Browserについて',
              message: 'Flune-Browser ' + app.getVersion(),
              detail: `Flune Browser
                バージョン: ${app.getVersion()}
                開発者: mf7cli
                
                Copyright 2022 mf7cli.`
            });
          }
        },
        {type:'separator'},
        {role:'services',   label:'サービス'},
        {type:'separator'},
        {role:'hide',       label:`${app_name}を隠す`},
        {role:'hideothers', label:'ほかを隠す'},
        {role:'unhide',     label:'すべて表示'},
        {type:'separator'},
        {role:'quit',       label:`${app_name}を終了`}
      ]
    }] : []),
  {
    label: 'ファイル',
    submenu: [
      isMac ? {role:'close', label:'ウィンドウを閉じる'} : {role:'quit', label:'終了'}
    ]
  },
  {
    label: '編集',
    submenu: [
      {role:'undo',  label:'元に戻す'},
      {role:'redo',  label:'やり直す'},
      {type:'separator'},
      {role:'cut',   label:'切り取り'},
      {
        label:'コピー',
        role: 'copy'
      },
      {role:'paste', label:'貼り付け'},
      ...(isMac ? [
          {role:'pasteAndMatchStyle', label:'ペーストしてスタイルを合わせる'},
          {role:'delete',    label:'削除'},
          {role:'selectAll', label:'すべてを選択'},
          {type:'separator' },
          {
            label: 'スピーチ',
            submenu: [
              {role:'startSpeaking', label:'読み上げを開始'},
              {role:'stopSpeaking',  label:'読み上げを停止'}
            ]
          }
        ] : [
          {role:'delete',    label:'削除'},
          {type:'separator'},
          {role:'selectAll', label:'すべてを選択'}
        ])
     ]
  },
  {
    label: '表示',
    submenu: [
      {label:'再読み込み',
      accelerator: 'CmdOrCtrl+R',
      click: () => {
        bv[open_tab].webContents.reload();
      }},
      {label:'強制的に再読み込み',
        accelerator: 'CmdOrCtrl+Shift+R',
        click: () => {
        bv[open_tab].webContents.reloadIgnoringCache();
      }},
      {
        accelerator: 'F12',
        click: () => {
          bv[open_tab].webContents.toggleDevTools();
        }, label:'開発者ツールを表示'
      },
      {type:'separator'},
      {role:'resetZoom',      label:'実際のサイズ'},
      {role:'zoomIn',         label:'拡大'},
      {role:'zoomOut',        label:'縮小'},
      {type:'separator'},
      {role:'togglefullscreen', label:'フルスクリーン'}
    ]
  },
  {
    label: 'ウィンドウ',
    submenu: [
      {role:'minimize', label:'最小化'},
      {role:'zoom',     label:'ズーム'},
      ...(isMac ? [
           {type:'separator'} ,
           {role:'front',  label:'ウィンドウを手前に表示'},
           {type:'separator'},
           {role:'window', label:'ウィンドウ'}
         ] : [
           {role:'close',  label:'閉じる'}
         ])
    ]
  },
  {
    label:'ヘルプ',
    submenu: [
      {label:`${app_name} ヘルプ`, click: () => {
        electron.shell.openExternal('https://twitter.com/made_in_apple_')
      }},
      ...(isMac ? [ ] : [
        {type:'separator'},
        {role:'about',  label:`${app.name}について` }
      ])
    ]
  }
]);

// メニューを適用する
electron.Menu.setApplicationMenu(template);