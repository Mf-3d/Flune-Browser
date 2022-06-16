const { app } = require("electron");
const electron = require("electron");

let win;
let bv = [];
let winSize;
let open_tab = 1;

let viewY = 47;
// let viewY = 200;

function nt() {
  let id = bv.length;
  bv[bv.length] = new electron.BrowserView({
    transparent: false,
    backgroundColor: '#ffffff',
    webPreferences: {
      worldSafeExecuteJavaScript: true,
      nodeIntegration:false,
      contextIsolation: true,
      preload: `${__dirname}/preload/preload.js`
    }
  });
  
  bv[bv.length - 1].webContents.loadFile(__dirname + "/src/views/home.html");

  win.addBrowserView(bv[bv.length - 1]);

  bv[bv.length - 1].setBounds({x: 0, y: viewY, width: winSize[0], height: winSize[1]-viewY});

  win.setTopBrowserView(bv[bv.length - 1]);


  bv[bv.length - 1].setAutoResize({width: true, height: true});

  open_tab = bv.length - 1;

  win.webContents.send('change_title', {
    title: bv[id].webContents.getTitle(),
    index: id
  });

  win.webContents.send('change_url', {
    url: bv[id].webContents.getURL()
  });
}

function ot(index) {
  open_tab = index;
  win.setTopBrowserView(bv[index]);


  bv[index].webContents.on('page-title-updated', () => {
    setTitle(index);
  });

  setTitle(index);
}

function setTitle(index) {
  console.debug(open_tab);
  win.webContents.send('change_title', {
    title: bv[index].webContents.getTitle(),
    index: index
  });

  win.webContents.send('change_url', {
    url: bv[index].webContents.getURL()
  });
}

function nw() {
  win = new electron.BrowserWindow({
    width: 1600, height: 900, minWidth: 400, minHeight: 400,
    frame: false,
    transparent: false,
    backgroundColor: '#ffffff',
    title: 'Flune-Browser v2',
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
}

electron.app.on("ready", nw);

electron.ipcMain.handle('new_tab', (event, data) => {
  nt();
});

electron.ipcMain.handle('close_tab', (event, index) => {
  win.removeBrowserView(bv[index]);
  bv[index].webContents.destroy();

  bv.splice(index, 1);

  index - 1;

  win.webContents.send('update_active_tab', {
    index: index
  });

  if(bv.length === 0){
    app.quit();
  }
});

electron.ipcMain.handle('open_tab', (event, index) => {
  ot(index);
  console.debug(index);
});

electron.ipcMain.handle('go_back', (event, data) => {
  bv[open_tab].webContents.goBack();
  setTitle(open_tab);
});

electron.ipcMain.handle('go_forward', (event, data) => {
  bv[open_tab].webContents.goForward();
  setTitle(open_tab);
});

electron.ipcMain.handle('reload', (event, data) => {
  bv[open_tab].webContents.reload();
  setTitle(open_tab);
});

electron.ipcMain.handle('searchURL', (event, data) => {
  if(data.slice(0, 5) === "https" || data.slice(0, 5) === "http:"){
    bv[open_tab].webContents.loadURL(data);
  }
  else{
    bv[open_tab].webContents.loadURL(`https://www.google.com/search?q=${data}`);
  }

  win.webContents.send('change_url', {
    url: bv[open_tab].webContents.getURL()
  });
});