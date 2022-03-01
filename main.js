const {app, BrowserWindow, dialog, Menu, ipcMain, BrowserView} = require('electron');
const Store = require('electron-store');
const store = new Store();
const contextMenu = require('electron-context-menu');
let win;
let bv=[];
let menu;
const is_windows = process.platform==='win32';
const is_mac = process.platform==='darwin';
const is_linux = process.platform==='linux';
var viewY = 72;

var index = 0;

let winSize;

contextMenu({
  showSaveImageAs: true
});

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
    webPreferences: {
      preload: `${__dirname}/src/preload.js`
    }
  });

  win.addBrowserView(bv[index]);

  bv[index].setBounds({ x: 0, y: viewY, width: winSize[0], height: winSize[1] - viewY });

  // bv.webContents.loadURL(`file://${__dirname}/src/resource/home.html`);
  bv[index].webContents.loadURL(`file://${__dirname}/src/resource/home.html`);
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
    menu.webContents.loadURL(`file://${__dirname}/src/index_mac.html`);
  }

  else if(is_windows) {
    menu.webContents.loadURL(`file://${__dirname}/src/index_win.html`);
  }

  win.webContents.on('close',()=>{
    store.set('width', win.getSize()[0]);
    store.set('height', win.getSize()[1]);
  });

  win.on('resize', () => {
    winSize = win.getSize();
    menu.setBounds({ x: 0, y: 0, width: winSize[0], height: viewY });
    bv[index].setBounds({ x: 0, y: viewY, width: winSize[0], height: winSize[1] - viewY });
  });

  bv[index].webContents.on('will-navigate', (e, url)=>{
    bv[index].webContents.loadURL(url);
  });

  bv[index].webContents.setWindowOpenHandler(({ url }) => {
    // if (url === 'about:blank') {
      nt(index + 1);
      bv[index + 1].webContents.loadURL(url);
      console.log('🧐')
      index = index + 1;
      return {
        action: 'deny'
      }
    // }
    // else {
    //   return {
    //     action: 'deny'
    //   }
    // }
  });

  bv[index].webContents.on('did-start-loading',()=>{});
  bv[index].webContents.on('did-stop-loading',()=>{
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
    viewY = 600;
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
  try{
    var ind = i;
    bv[ind].webContents.destroy();
    win.removeBrowserView(bv[ind]);
    bv.splice(ind,1);
    index - 1;
  }
  catch(e){
    console.log(e);
    console.log(ind);
  }

  if(index == 0){
    nt(0);
    menu.webContents.send('newtab', 0);
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

ipcMain.handle('pageforward', (event, data) => {
  bv[index].webContents.goForward();
  menu.webContents.send('page_changed', '');
});

ipcMain.handle('open_home', (event, data) => {
  bv[index].webContents.loadURL(`file://${__dirname}/src/resource/home.html`);
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

ipcMain.handle('show_context_menu', (event, data) => {
  const template = [
    {
      label: 'Menu Item 1',
      click: () => { event.sender.send('context-menu-command', 'menu-item-1') }
    },
    { type: 'separator' },
    { label: 'Menu Item 2', type: 'checkbox', checked: true }
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
              detail: `Flune Browser 1.0.0 Alpha 3
                バージョン: 1.0.0 Alpha 3
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
          bv[index].webContents.openDevTools();
        }, 
        label:'開発者ツールを表示'
      },
      {
        accelerator: 'F12',
        click:()=>{
          menu.webContents.openDevTools();
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
