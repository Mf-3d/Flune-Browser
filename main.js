const { app } = require("electron");
const electron = require("electron");
const Store = require('electron-store');
const store = new Store();

let win;
let setting_win;
let bv = [];
let winSize;
let open_tab = 1;

let app_name = "Flune-Browser 2.0.0";

let viewY = 51;
// let viewY = 200;

const isMac = (process.platform === 'darwin');

function nt(url) {
  let id = bv.length;
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
    bv[bv.length - 1].webContents.loadFile(__dirname + "/src/views/home.html");
  }

  win.addBrowserView(bv[bv.length - 1]);

  bv[bv.length - 1].setBounds({x: 0, y: viewY, width: winSize[0], height: winSize[1]-viewY});

  win.setTopBrowserView(bv[bv.length - 1]);


  bv[id].setAutoResize({width: true, height: true});

  open_tab = bv.length - 1;

  bv[id].webContents.on('page-title-updated', () => {
    setTitle(id);
  });

  bv[id].webContents.on('new-window', (event, url) => {
    event.preventDefault();
    nt(url);
    win.webContents.send('new_tab_elm', {});
  });
}

function ot(index) {
  open_tab = index;
  win.setTopBrowserView(bv[index]);

  setTitle(index);
}

function setTitle(index) {
  bv[index].setBackgroundColor('#fafafa');
  console.debug(open_tab);
  let url = new URL(bv[index].webContents.getURL());
  if(String(url) === String(new URL("file://" + __dirname + "/src/views/home.html"))){
    url = "";
  }
  else{
    console.debug(String(new URL("file://" + __dirname + "/src/views/home.html")), String(url));
  }

  win.webContents.send('change_title', {
    title: bv[index].webContents.getTitle(),
    index: index
  });

  win.webContents.send('change_url', {
    url: new String(url)
  });
}

function ns() {
  setting_win = new electron.BrowserWindow({
    width: 600, height: 400, minWidth: 600, minHeight: 400,
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

  setting_win.loadFile(`${__dirname}/src/views/setting.html`);

  setting_win.on('closed', () => {
    setting_win = null;
  });
}

function nw() {
  win = new electron.BrowserWindow({
    width: 1200, height: 700, minWidth: 600, minHeight: 400,
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

  winSize = win.getSize();

  win.loadFile(`${__dirname}/src/views/menu.html`);

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
}

electron.app.on("ready", nw);

electron.ipcMain.handle('new_tab', (event, data) => {
  nt();
});

electron.ipcMain.handle('close_tab', (event, index) => {
  if(bv.length === 1){
    win.removeBrowserView(bv[0]);
    bv[0].webContents.destroy();
    app.quit();
    
    return;
  }
  win.removeBrowserView(bv[index]);
  console.debug(index);
  bv[index].webContents.destroy();

  bv.splice(index, 1);

  if(bv.length === 0){
    app.quit();
    return;
  }

  if(index === 0 && bv.length !== 0){
    index = index;
  }
  else{
    index = index - 1;
  }

  ot(index);

  win.webContents.send('active_tab', {
    index: index
  });

  open_tab = index;
  bv[index].webContents.send('each');
});

electron.ipcMain.handle('open_tab', (event, index) => {
  ot(index);
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
  return '../style/dark_theme.css'
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

electron.ipcMain.handle('reload', (event, data) => {
  bv[open_tab].webContents.reload();
  setTitle(open_tab);
});

electron.ipcMain.handle('searchURL', (event, word) => {
  let url;

  if (word.slice(0, 4) === 'http') {
    url = `${word}`;
  } else if(word.slice(0, 3) === 'file') {
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
  if(!setting_win){
    ns();
  }
  else{
    setting_win.close();
    setting_win = null;
  }
});

electron.ipcMain.handle('save_setting', (event, data) => {
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
    role: 'copy'
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
        {role:'about',      label:`${app_name}について` },
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
      {role:'copy',  label:'コピー'},
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