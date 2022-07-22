const electron = require('electron');

/** @type {electron.BrowserView} */
let messageBox;

/** @type {function[]} */
let notice_callback = [];
let timer;

module.exports  = class {
  /** 
   * @param {electron.BrowserWindow} win BrowserWindow
   */
  constructor(win) {
    /** @type {electron.BrowserWindow} win */
    this.win = win;

    messageBox = new electron.BrowserView({
      transparent: true,
      backgroundColor: '#ffffff',
      webPreferences: {
        scrollBounce: false,
        worldSafeExecuteJavaScript: true,
        nodeIntegration:false,
        contextIsolation: true,
        preload: `${__dirname}/preload/preload_sidebar.js`
      }
    });

    messageBox.setAutoResize({width: true, height: true});
    messageBox.setBounds({
      x: 0,
      y: 0,
      width: 100,
      height: win.getSize()[1]
    });

    messageBox.webContents.loadURL('flune://sidebar');

    try {
      electron.ipcMain.handle('return', (event, [index, value]) => {
        if(notice_callback.length <= 0){
          win.removeBrowserView(messageBox);
          clearInterval(timer);
        }
  
        for (let i = index; i < timer.length; i--) {
          try{
            notice_callback[i](event, value);
            break;
          } catch(e){}
        }
        
        notice_callback.splice(index, 1);
        if(notice_callback.length <= 0){
          win.removeBrowserView(messageBox);
          clearInterval(timer);
        }
      });

      electron.ipcMain.handle('closeSidebar', (event) => {
        win.removeBrowserView(messageBox);
        notice_callback = [];
        clearInterval(timer);
      });
    } catch (e) {}
  }

  /** 
   * @param {string} message Message
   * @param {'info' | 'warning' | 'error'} type Message type
   * @param {string[]} button Message button (Default: 'OK')
   * @param {function(event, number)} callback
   * @experimental
   */
  show(message, type, button, callback) {
    clearInterval(timer);
    if(button.length === 0){
      console.error('There must be at least one button.');
      return;
    }

    if(!button) button = ['OK', 'Cancel'];

    this.win.addBrowserView(messageBox);
    timer = setInterval(() => {
      if(this.win.isDestroyed() || messageBox.webContents.isDestroyed()) return;
      this.win.setTopBrowserView(messageBox);
    }, 3000);

    messageBox.setBounds({
      x: this.win.getSize()[0] - 300,
      y: 50,
      width: 300,
      height: this.win.getSize()[1] - 50
    });

    if(type !== 'info' && type !== 'warning' && type !== 'error') {
      console.error('The type should be "info", "warning" or "error".');
      return;
    }

    notice_callback[notice_callback.length] = callback;
    
    messageBox.webContents.send(type, [message, button]);
  }
}