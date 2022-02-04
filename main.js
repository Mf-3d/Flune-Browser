const {app, BrowserWindow, dialog, Menu, ipcMain, BrowserView} = require('electron');
const Store = require('electron-store');
const store = new Store();
const contextMenu = require('electron-context-menu');
let win;
let bv;
let menu;
const is_windows = process.platform==='win32';
const is_mac = process.platform==='darwin';
const is_linux = process.platform==='linux';
var viewY = 45;

let winSize;

function nw(){
  win=new BrowserWindow({
    width: store.get('width', 800),
    height: store.get('height', 500),
    minWidth: 800, 
    minHeight: 400,
    icon: `${__dirname}/icon.png`,
    frame: false,
    toolbar: false,
    title: 'Flune Browser'
  });

  winSize = win.getSize();

  bv=new BrowserView({
      width: `${win.getSize()[0]}`,
      webPreferences: {
        preload: `${__dirname}/src/preload.js`
      }
  });

  menu=new BrowserView({
    width: `${win.getSize()[0]}`,
    webPreferences: {
      preload: `${__dirname}/src/preload.js`
    }
  });
  // menu.webContents.openDevTools();

  win.setBrowserView(bv);
  win.addBrowserView(menu);
  menu.setBounds({ x: 0, y: 0, width: winSize[0], height: viewY });
  if(is_mac) {
    menu.webContents.loadURL(`file://${__dirname}/src/index_mac.html`);
  }

  else if(is_windows) {
    menu.webContents.loadURL(`file://${__dirname}/src/index_win.html`);
  }

  bv.setBounds({ x: 0, y: viewY, width: winSize[0], height: winSize[1] - viewY });

  // bv.webContents.loadURL(`file://${__dirname}/src/resource/home.html`);
  bv.webContents.loadURL(`file://${__dirname}/src/resource/home.html`);

  win.webContents.on('close',()=>{
    store.set('width', win.getSize()[0]);
    store.set('height', win.getSize()[1]);
  });

  win.on('resize', () => {
    winSize = win.getSize();
    menu.setBounds({ x: 0, y: 0, width: winSize[0], height: viewY });
    bv.setBounds({ x: 0, y: viewY, width: winSize[0], height: winSize[1] - viewY });
  });

  bv.webContents.on('did-start-loading',()=>{});
  bv.webContents.on('did-stop-loading',()=>{
    // 盗人ブルートしてきた
    console.log(bv.webContents.getURL())
    menu.webContents.executeJavaScript(`document.getElementById('url').value = '${bv.webContents.getURL()}'`)
  });
}

app.on('ready',()=>{
  nw();
  console.log(process.argv[2])
  if(process.argv[2] == '--dev'){
    console.log('develop!');
    viewY = 100;
    menu.webContents.openDevTools();
  }
});
app.on('window-all-closed', ()=>app.quit());
app.on('activate',()=>{if (win === null) nw});

// IPC
ipcMain.handle('open_url', (event, data) => {
  url_regexp = /(https:?|http:?|file:\/)\/\/([\w\/:%#\$&\?\(\)~\.=\+\-]+)/g;
  no_http_url_regexp = /([\w\/:%#\$&\?\(\)~\.=\+\-]+)/g;
  if(data.match(url_regexp)) {
    console.log('🤔')
    bv.webContents.loadURL(data);
    menu.webContents.send('page_changed', data);
  }
  else if(data.match('://')){
    bv.webContents.loadURL(data);
    menu.webContents.send('page_changed', data);
  }
  else {
    bv.webContents.loadURL('https://www.google.com/search?q=' + data);
    menu.webContents.send('page_changed', data);
  }
  console.log(data);
});

ipcMain.handle('pageback', (event, data) => {
  bv.webContents.goBack();
  menu.webContents.send('page_changed', '');
});

ipcMain.handle('bv_url', (event, data) => {
  return (bv.webContents.getURL());
});

ipcMain.handle('pageforward', (event, data) => {
  bv.webContents.goForward();
  menu.webContents.send('page_changed', '');
});

ipcMain.handle('open_home', (event, data) => {
  bv.webContents.loadURL(`file://${__dirname}/src/resource/home.html`);
  menu.webContents.send('page_changed', '');
});

ipcMain.handle('close', (event, data) => {
  win.close();
});

ipcMain.handle('maximize', (event, data) => {
  win.maximize();
});

ipcMain.handle('minimize', (event, data) => {
  win.minimize();
});

ipcMain.handle('maxmin', (event, data) => {
  if(win.isMaximized()==true) {
    win.unmaximize();
  }
  else {
    win.maximize();
  }
});

const template = Menu.buildFromTemplate([
  ...(is_mac ? [{
      label: 'Flune Browser',
      submenu: [
        {
          accelerator: 'CmdOrCtrl+Alt+A',
          click: ()=>{
            dialog.showMessageBox(null, {
              type: 'info',
              icon: './src/icon.png',
              title: 'Flune Browserについて',
              message: 'Flune Browserについて',
              detail: `Flune Browser 1.0.0 Alpha 3
                バージョン: 1.0.0 Alpha 3
                開発者: mf7cli
                
                Copyright 2022 mf7cli.`
              }
            )
          }, 
          label:`Flune Browserについて` 
        },
        {type:'separator'},
        {role:'services',   label:'サービス'},
        {type:'separator'},
        {role:'hide',       label:`Flune Browserを隠す`},
        {role:'hideothers', label:'ほかを隠す'},
        {role:'unhide',     label:'すべて表示'},
        {type:'separator'},
        {role:'quit',       label:`Flune Browserを終了`}
      ]
    }] : []),
  {
    label: 'ファイル',
    submenu: [
      is_mac ? {role:'close', label:'ウィンドウを閉じる'} : {role:'quit', label:'終了'}
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
      ...(is_mac ? [
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
      {
        accelerator: 'Shift+R',
        click:()=>{
          bv.webContents.reload();
        },         
        label:'再読み込み'
      },
      {
        accelerator: 'Shift+Alt+R',
        click:()=>{
          bv.webContents.reloadIgnoringCache();
        },         
        label:'強制的に再読み込み'
      },
      {
        accelerator: 'F12',
        click:()=>{
          bv.webContents.openDevTools();
        }, 
        label:'開発者ツールを表示'
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
      ...(is_mac ? [
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
      {label:`Flune Browser ヘルプ`},    // ToDo
      ...(is_mac ? [ ] : [
        {type:'separator'} ,
        {
          accelerator: 'CmdOrCtrl+Alt+A',
          click: ()=>{
            dialog.showMessageBox(null, {
              type: 'info',
              icon: './src/icon.png',
              title: 'Flune Browserについて',
              message: 'Flune Browserについて',
              detail: `Flune Browser 1.0.0 Alpha 3
                バージョン: 1.0.0 Alpha 3
                開発者: mf7cli
                
                Copyright 2022 mf7cli.`
              }
            )
          }, 
          label:`Flune Browserについて` 
        }
      ])
    ]
  }
]);

// メニューを適用する
Menu.setApplicationMenu(template);
