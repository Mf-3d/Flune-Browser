const {app, BrowserWindow, dialog, Menu, ipcMain, BrowserView} = require('electron');
const Store = require('electron-store');
const store = new Store();
const fs = require('fs');
const path = require('path');
const tab = require('./tab')
let win;
let bv = [];
let menu;
let setting;
const is_windows = process.platform==='win32';
const is_mac = process.platform==='darwin';
const is_linux = process.platform==='linux';
var theme_json = JSON.parse(fs.readFileSync(store.get('theme', '/config/theme/Dark/theme.json'), 'utf-8'));
var theme_url = store.get('theme', __dirname + '/config/theme/Dark/theme.json');
console.log(theme_json);
var viewY = 72;
var index = 0;

theme_url = __dirname + '/config/theme/Dark/theme.json';

let winSize;

let version = '1.1.0';

function nt(index){
  bv[index] = new BrowserView({
    width: store.get('width', 800),
    height: store.get('height', 500),
    minWidth: 800, 
    minHeight: 400,
    icon: `${__dirname}/icon.png`,
    frame: false,
    toolbar: false,
    title: 'Flune Browser',
    background: '#ffffff',
    transparent: false,
    webPreferences: {
      preload: `${__dirname}/src/preload.js`
    }
  });

  bv[index].webContents.executeJavaScript(`
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      window.api.show_context_menu();
    });`
  );  

  bv[index].setBackgroundColor('#ffffff');

  win.addBrowserView(bv[index]);

  bv[index].setBounds({ x: 0, y: viewY, width: winSize[0], height: winSize[1] - viewY });

  bv[index].webContents.loadFile(`${path.dirname(theme_url)}/${theme_json.theme.start.html}`);
}

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

  nt(0);

  menu=new BrowserView({
    width: `${win.getSize()[0]}`,
    webPreferences: {
      preload: `${__dirname}/src/preload.js`
    }
  });
  // menu.webContents.openDevTools();

  win.addBrowserView(menu);
  menu.setBounds({ x: 0, y: 0, width: winSize[0], height: viewY });
  if(is_mac) {
    menu.webContents.loadFile(`${path.dirname(theme_url)}/${theme_json.theme.nav.html_mac}`);
  }

  else if(is_windows) {
    menu.webContents.loadFile(`${path.dirname(theme_url)}/${theme_json.theme.nav.html_win}`);
  }

  else if(is_linux) {
    menu.webContents.loadFile(`${path.dirname(theme_url)}/${theme_json.theme.nav.html_linux}`);
  }

  win.webContents.on('close',()=>{
    store.set('width', win.getSize()[0]);
    store.set('height', win.getSize()[1]);
    store.set('theme', store.get('theme', __dirname + '/config/theme/Dark/theme.json'));
  });

  win.on('resize', () => {
    winSize = win.getSize();
    menu.setBounds({ x: 0, y: 0, width: winSize[0], height: viewY });
    bv[index].setBounds({ x: 0, y: viewY, width: winSize[0], height: winSize[1] - viewY });
  });

  bv[index].webContents.on('will-navigate', (e, url)=>{
    bv[index].webContents.loadURL(url);
  });

  bv[index].webContents.on('did-start-loading',()=>{});
  bv[index].webContents.on('did-stop-loading',()=>{
    bv[index].setBackgroundColor('#fff');
    bv[index].webContents.executeJavaScript(`
      window.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        window.api.show_context_menu();
      });`
    );
    // 盗人ブルートしてきた
    console.log(bv[index].webContents.getURL());
    menu.webContents.executeJavaScript(`document.getElementById('url').value = '${bv[index].webContents.getURL()}'`);
  });
}

app.on('ready',()=>{
  nw();
  console.log(index);
  console.log(process.argv[2])
  if(process.argv[2] == '--dev'){
    console.log('develop!');
    viewY = 200;
    menu.webContents.openDevTools();
  }
});
app.on('window-all-closed', ()=>app.quit());
app.on('activate',()=>{if (win === null) nw});

// IPC

// Monotから盗人ブルートしてきた
ipcMain.handle('tab_move',(e,i)=>{
  menu.webContents.send('page_changed', '');
  if(i<0)
    i=0;
  win.setTopBrowserView(bv[i]);
  index= i;
  console.log(index);
  win.webContents.executeJavaScript(
    `document.getElementsByTagName('title')[0].innerText='${bv[i].webContents.getTitle()}';`
  );
  bv[index].setBounds({ x: 0, y: viewY, width: winSize[0], height: winSize[1] - viewY });
});

// Monotから盗人ブルートしてきた
ipcMain.handle('remove_tab',(e,i)=>{
  //source: https://www.gesource.jp/weblog/?p=4112
  console.log('あ' + i);
  try{
    var ind = i;
    console.log(bv[ind]);
    bv[ind].webContents.destroy();
    win.removeBrowserView(bv[ind]);
    index -= 1;
    if(ind == index){
      index += 2;
      console.log(index);
    }
    if(bv[index] === undefined){
      nt(index);
      menu.webContents.send('newtab', index);
    }
    if(bv[index] === null){
      nt(index);
      menu.webContents.send('newtab', index);
    }
  }
  catch(e){
    nt(index + 1);
    bv[index + 1].webContents.loadFile(__dirname + '/src/resource/error.html');
    index = index + 1;
    menu.webContents.send('new_tab');
    console.log(e);
  }
})

ipcMain.handle('open_url', (event, data) => {
  url_regexp = /(https:?|http:?|file:\/)\/\/([\w\/:%#\$&\?\(\)~\.=\+\-]+)/g;
  no_http_url_regexp = /([\w\/:%#\$&\?\(\)~\.=\+\-]+)/g;
  if(data.match(url_regexp)) {
    console.log('🤔')
    bv[index].webContents.loadURL(data);
    menu.webContents.send('page_changed', data);
  }
  else if(data.match('://')){
    bv[index].webContents.loadURL(data);
    menu.webContents.send('page_changed', data);
  }
  else {
    bv[index].webContents.loadURL('https://www.google.com/search?q=' + data);
    menu.webContents.send('page_changed', data);
  }
  console.log(data);
});

ipcMain.handle('apply_setting', (event, data) => {
  if(data !== null){
    if(data === 'Dark'){
      store.set('theme', __dirname + '/config/theme/Dark/theme.json');
    }
    else if(data === 'Light'){
      store.set('theme', __dirname + '/config/theme/Light/theme.json');
    }
    else {
      store.set('theme', data);
    }
  }
});

ipcMain.handle('pageback', (event, data) => {
  bv[index].webContents.goBack();
  menu.webContents.send('page_changed', '');
});

ipcMain.handle('bv_url', (event, data) => {
  return (bv[index].webContents.getURL());
});

ipcMain.handle('open_tab', (event, tabindex) => {
  win.addBrowserView(bv[tabindex]);
  bv[tabindex].setBounds({ x: 0, y: viewY, width: winSize[0], height: winSize[1] - viewY });
  index = tabindex;
});

ipcMain.handle('new_tab', (event, tabindex) => {
  nt(tabindex);
  index = tabindex;
});

ipcMain.handle('version', (event, tabindex) => {
  return version;
});

ipcMain.handle('pageforward', (event, data) => {
  bv[index].webContents.goForward();
  menu.webContents.send('page_changed', '');
});

ipcMain.handle('open_home', (event, data) => {
  bv[index].webContents.loadFile(`${path.dirname(theme_url)}/${theme_json.theme.start.html}`);
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

ipcMain.handle('open_setting', (event, data) => {
  setting = new BrowserWindow({
    width: 700,
    height: 600,
    icon: `${__dirname}/icon.png`,
    toolbar: false,
    title: 'Flune Browser',
    webPreferences: {
      preload: `${__dirname}/src/preload.js`
    }
  });
  setting.webContents.executeJavaScript(`
      window.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        window.api.show_context_menu();
      });`
  );
  setting.webContents.loadFile(`src/resource/setting.html`);

  setting.on('close', () => {
    
  });
});

ipcMain.handle('close_setting', (event, data) => {
  setting.close();
  console.log('👍');
});

ipcMain.handle('show_context_menu', (event, data) => {
  const template = [
    { role: 'undo' },
    { role: 'redo' },
    { type: 'separator' },
    { role: 'cut' },
    { role: 'copy' },
    { role: 'paste' },
    { 
      label: 'Reload',
      click: () => {
        setting.webContents.openDevTools();
      }
    },
    ...(is_mac ? [
      { role: 'pasteAndMatchStyle' },
      { role: 'delete' },
      { role: 'selectAll' },
      { type: 'separator' },
      {
        label: 'Speech',
        submenu: [
          { role: 'startSpeaking' },
          { role: 'stopSpeaking' }
        ]
      }
    ] : [
      { role: 'delete' },
      { type: 'separator' },
      { role: 'selectAll' }
    ]),
    { type: 'separator' },
    {
      accelerator: 'Shift+R',
      click:()=>{
        bv[index].webContents.reload();
      },         
      label:'再読み込み'
    },
    {
      accelerator: 'Shift+Alt+R',
      click:()=>{
        bv[index].webContents.reloadIgnoringCache();
      },         
      label:'強制的に再読み込み'
    },
    {
      accelerator: 'F12',
      click:()=>{
        bv[index].webContents.toggleDevTools();
      }, 
      label:'開発者ツールを表示'
    },
    {
      accelerator: 'F12',
      click:()=>{
        menu.webContents.toggleDevTools();
      }, 
      label:'ナビゲーションの開発者ツールを表示'
    },
    {type:'separator'},
    {role:'resetZoom',      label:'実際のサイズ'},
    {role:'zoomIn',         label:'拡大'},
    {role:'zoomOut',        label:'縮小'},
    {type:'separator'},
    {role:'togglefullscreen', label:'フルスクリーン'}
  ]
  const menu = Menu.buildFromTemplate(template)
  menu.popup(BrowserWindow.fromWebContents(event.sender));
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
              detail: `Flune Browser
                バージョン: ${version}
                開発者: mf7cli
                License by monochrome License.
                
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
          bv[index].webContents.reload();
        },         
        label:'再読み込み'
      },
      {
        accelerator: 'Shift+Alt+R',
        click:()=>{
          bv[index].webContents.reloadIgnoringCache();
        },         
        label:'強制的に再読み込み'
      },
      {
        accelerator: 'F12',
        click:()=>{
          bv[index].webContents.toggleDevTools();
        }, 
        label:'開発者ツールを表示'
      },
      {
        accelerator: 'F12',
        click:()=>{
          menu.webContents.toggleDevTools();
        }, 
        label:'ナビゲーションの開発者ツールを表示'
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
    label:'Develop',
    submenu: [
      {
        label:'Betaバージョンを試す',
        click: () => {
          //
        }
      },
      {
        label:'Devバージョンを試す',
        click: () => {
          //
        }
      }
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
              detail: `Flune Browser
                バージョン: ${version}
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
