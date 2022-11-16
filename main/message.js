const electron = require('electron');
const global = require("./main/global");

/** @type {function[]} */
let notice_callback = [];
let timer;

let sidebarDisplayed = false;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** 
 * Notification manager.
 */
module.exports  = class {
  /** 
   * @param {electron.BrowserWindow} win BrowserWindow
   */
  constructor(win) {
    /** @type {electron.BrowserWindow} win */
    this.win = win;

    global.messageBox = new electron.BrowserView({
      transparent: true,
      backgroundColor: '#ffffff',
      webPreferences: {
        scrollBounce: false,
        worldSafeExecuteJavaScript: true,
        nodeIntegration:false,
        contextIsolation: true,
        preload: `${__dirname}/../preload/preload_sidebar.js`,
        sandbox: false
      }
    });

    global.messageBox.setAutoResize({width: true, height: true});
    global.messageBox.setBounds({
      x: this.win.getSize()[0] - 300,
      y: 50,
      width: 300,
      height: this.win.getSize()[1] - 50
    });

    global.messageBox.webContents.loadURL('flune://sidebar');

    try {
      electron.ipcMain.handle('return', (event, [index, value]) => {
        if(notice_callback.length <= 0){
          win.removeBrowserView(global.messageBox);
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
          win.removeBrowserView(global.messageBox);

          clearInterval(timer);
        }
      });

      electron.ipcMain.handle('closeSidebar', (event) => {
        win.removeBrowserView(global.messageBox);
        
        notice_callback = [];
        clearInterval(timer);
        sidebarDisplayed = false;
      });

      win.on('resize', (event) => {
        global.messageBox.setBounds({
          x: this.win.getSize()[0] - 300,
          y: 50,
          width: 300,
          height: this.win.getSize()[1] - 50
        });
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

    this.win.addBrowserView(global.messageBox);

    timer = setInterval(() => {
      if(!this.win || !global.messageBox || !sidebarDisplayed) return;
      this.win.setTopBrowserView(global.messageBox);
    }, 3000);


    global.messageBox.setBounds({
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
    
    global.messageBox.webContents.send(type, [message, button]);
    sidebarDisplayed = true;
  }
}