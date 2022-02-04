const {app, BrowserWindow, dialog, Menu, ipcMain, BrowserView} = require('electron');
const Store = require('electron-store');
const store = new Store();
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
    toolbar: false
  });

  winSize = win.getSize();

  bv=new BrowserView({
      width: `${win.getSize()[0]}`,
      webPreferences: {
        preload: `${__dirname}/src/preload.js`
      }
  });

  bv.webContents.openDevTools();
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
  }
  if(data.match(no_http_url_regexp)) {
    if(data.match('file:///')) {
      bv.webContents.loadURL(data);
    }
    else {
      console.log('😔')
      bv.webContents.loadURL('https://' + data);
    }
  }
  else {
    bv.webContents.loadURL('https://www.google.com/search?q=' + data);
  }
  console.log(data);
});

ipcMain.handle('page_back', (event, data) => {
  bv.webContents.goBack();
});

ipcMain.handle('open_home', (event, data) => {
  bv.webContents.loadURL(`file://${__dirname}/src/resource/home.html`);
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

// let menu=Menu.buildFromTemplate([
//   {
//     label: 'ファイル',
//     submenu: [
//       {
//         label: '上書き保存',
//         accelerator: 'CmdOrCtrl+S',
//         click: ()=>{
//           if (filepath == ''){
//             win.webContents.executeJavaScript(`
//               node.showSaveDialog(document.getElementsByTagName('textarea')[0].value)
//             `);
//           } else if (filepath != '') {
//             win.webContents.executeJavaScript(`
//               node.overwriteSave(document.getElementsByTagName('textarea')[0].value)
//             `)
//           }
//         }
//       },
//       {
//         label: '名前を付けて保存',
//         accelerator: 'CmdOrCtrl+Shift+S',
//         click: ()=>{
//           win.webContents.executeJavaScript(`
//             node.showSaveDialog(document.getElementsByTagName('textarea')[0].value)
//           `);
//         }
//       },
//       {
//         label: '開く',
//         accelerator: 'CmdOrCtrl+O',
//         click: ()=>{
//           win.webContents.executeJavaScript(`
//             node.showOpenDialog();
//           `)
//         }
//       }
//     ]
//   }
// ])

// Menu.setApplicationMenu(menu);
