const electron = require('electron');
const { app } = require('electron');
const applicationMenu = require('./applicationMenu.js');
const Store = require('electron-store');
const store = new Store();
const history = require('./history');
const global = require("./global");

/** @type {electron.BrowserWindow} */
let win;

/** @type {electron.BrowserView[]} */
let bv = [];

let viewY = 50;
let open_tab = 1;
let timer = [];
let winSize;
let favicon = [];

/**
 * Tab manager.
 * @author mf7cli
 */
module.exports = class {
  /** 
   * @param {electron.BrowserWindow} mainWindow
   * @param {number[]} windowSize
   * @param {string} dirname
   */
  constructor(mainWindow, windowSize, dirname) {
    win = mainWindow;
    winSize = windowSize;
    __dirname = dirname;
    this.bv = bv;
    this.open_tab = 0;
  }

  /** 
   * @param {string | undefined} url
   * @param {boolean | undefined} setHtmlTitle
   */
  nt(url, setHtmlTitle) {
    if(setHtmlTitle === true){
      win.webContents.send('new_tab_elm', {});
    }
    
    let id = bv.length;

    bv[bv.length] = new electron.BrowserView({
      transparent: false,
      backgroundColor: '#ffffff',
      webPreferences: {
        scrollBounce: true,
        nodeIntegration:false,
        contextIsolation: true,
        sandbox: false,
        preload: `${__dirname}/preload/preload_browserview.js`
      }
    });

    favicon[id] = '';
  
    if(url){
      bv[bv.length - 1].webContents.loadURL(url);
      this.setTitle(id);
    }
    else{
      bv[bv.length - 1].webContents.loadURL("file://" + __dirname + "/src/views/home.html");
    }

    bv[bv.length - 1].webContents.setVisualZoomLevelLimits(1, 5);

    win.addBrowserView(bv[bv.length - 1]);
    win.setTopBrowserView(bv[bv.length - 1]);
    bv[bv.length - 1].setBounds({x: 0, y: viewY, width: win.getSize()[0], height: win.getSize()[1] - viewY});

    bv[id].setAutoResize({width: true, height: true});

    open_tab = bv.length - 1;

    bv[id].webContents.setWindowOpenHandler((details) => {
      win.webContents.send('new_tab_elm', {});
      this.nt(details.url);
      console.log(`\x1b[48;2;58;106;194m\x1b[38;2;255;255;255m INFO \x1b[0m 新しいタブがsetWindowOpenHandlerによって生成されました`);
      return { action: 'deny' };
    });

    win.webContents.send('change-favicon', {
      index: id,
      favicon: ''
    });

    this.ot(id);
    this.bv = bv;
  }

  /** 
   * @param {number} index
   */
  ot(index) {
    if(!bv[index]) return;
    // これつけないと起動した時のタブが操作されてしまう（？）
    electron.Menu.setApplicationMenu(applicationMenu.application_menu(app, win, bv, open_tab));
    win.webContents.send('open_tab_elm', index);
    this.open_tab = index;
    open_tab = index;
    win.setTopBrowserView(bv[index]);
    
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
    try {
      if(!win) return;
      bv[index].webContents.on('did-start-loading', () => {
        global.win.removeBrowserView(global.suggestView);
        global.suggestDisplayed = false;

        win.webContents.send('update-loading', {
          index,
          loading: true
        });
  
        win.webContents.send('change-favicon', {
          index,
          favicon: ''
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
          index,
          loading: false
        });

        this.setTitle(index);
      });

      let userAgent = bv[index].webContents.getUserAgent()
        .replace('Flune-Browser', 'Chrome')
        .replace(/flune-browser\/[0-9].[0-9].[0-9]/, '')
        .replace(/Electron\/[0-9][0-9].[0-9].[0-9]/, '')
        .replace(' 0.1.0 ', ' ')
        .replace(`Chrome/${electron.app.getVersion()}`, '');
    
      bv[index].webContents.setUserAgent(userAgent);

      console.log(`UA: ${userAgent}`);
      
      bv[index].webContents.on('media-started-playing', () => {
        win.webContents.send('each');
        if(!timer[index]){
          clearInterval(timer[index]);
          timer[index] = null;
          timer[index] = setInterval(() => {
            if(win && bv[index]){
              try {
                win.webContents.send('update-audible', {
                  index: index,
                  audible: bv[index].webContents.isCurrentlyAudible()
                });
              } catch(e) {
              }
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

        favicon[index] = favicons[0];
      });
    
      bv[index].webContents.on('page-title-updated', () => {
        bv[index].setBackgroundColor('#ffffff');
        if(bv[index]){
          console.log(`\x1b[48;2;58;106;194m\x1b[38;2;255;255;255m INFO \x1b[0m setTitleに${index}の更新を要求しました 現在のタブ数: ${bv.length}`);
          this.setTitle(index);
        }
        else if(bv[index - 1]){
          console.log(`\x1b[48;2;58;106;194m\x1b[38;2;255;255;255m INFO \x1b[0m setTitleに${index - 1}の更新を要求しました 現在のタブ数: ${bv.length}`);
          this.setTitle(index - 1);
        }
        else if(bv[index + 1]){
          console.log(`\x1b[48;2;58;106;194m\x1b[38;2;255;255;255m INFO \x1b[0m setTitleに${index + 1}の更新を要求しました 現在のタブ数: ${bv.length}`);
          this.setTitle(index + 1);
        }
        else{
          console.log(`\x1b[48;2;58;106;194m\x1b[38;2;255;255;255m INFO \x1b[0m setTitleに${index}の更新を要求しました 現在のタブ数: ${bv.length}`);
          this.setTitle(index);
        }
      });
    
      bv[index].webContents.on('context-menu', (event, params) => {
        event.preventDefault();
    
        const context_menu = applicationMenu.context_menu(bv, open_tab, params, win).context_menu;
        const context_menu_link_image = applicationMenu.context_menu(bv, open_tab, params, win).context_menu_link_image;
        const context_menu_link = applicationMenu.context_menu(bv, open_tab, params, win).context_menu_link_image;
        const context_menu_link_text = applicationMenu.context_menu(bv, open_tab, params, win).context_menu_link_text;
        const context_menu_text = applicationMenu.context_menu(bv, open_tab, params, win).context_menu_text;
        const context_menu_img = applicationMenu.context_menu(bv, open_tab, params, win).context_menu_img;
    
        this.setTitle(index);
    
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
        this.nt(details.url);
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

        this.setTitle(index);
      });
    
      bv[index].webContents.on('did-finish-load', () => {
        if (!bv[index].webContents.canGoForward()) history.addHistory(bv[index].webContents.getURL(), {}, open_tab);

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

        this.setTitle(index);
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
              this.deleteTab(index);
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
              this.deleteTab(index);
            }
          }
        });
      });
    
      this.setTitle(index);

      this.bv = bv;
    } catch(e) {

    }
  }

  /**
   * @param {number} index
   */
  deleteTab(index) {
    history.deleteHistoryTab(index);
    clearInterval(timer[index]);
    timer[index] = null;
    timer.splice(index, 1);

    favicon.splice(index, 1);
  
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
  
    open_tab = index;
    
    if(bv.length > 1){
      win.webContents.send('each');
  
      this.ot(index);
  
  
      win.webContents.send('active_tab', {
        index
      });
    }

    electron.Menu.setApplicationMenu(applicationMenu.application_menu(app, win, bv, open_tab));
  }
  
  setTitle(index) {
    if(!index) index = open_tab;
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

    let title = bv[index].webContents.getTitle();

    if(title.trim() === '' || !title){
      title = new String(url);
    }

    if(title.trim() === '' || !title){
      title = '　';
    }
  
    win.webContents.send('change_title', {
      title: title,
      index: index
    });
  
    if(open_tab === index){
      win.webContents.send('change_url', {
        url: new String(url)
      });
    }
  }

  goBack() {
    bv[open_tab].webContents.goBack();
    history.changeActiveHistory(history.getActiveHistory(open_tab) - 1, open_tab);
  }

  goForward() {
    bv[open_tab].webContents.goForward();
    history.changeActiveHistory(history.getActiveHistory(open_tab) + 1, open_tab);
  }

  reload() {
    bv[open_tab].webContents.reload();
  }

  loadURL(url) {
    history.addHistory(url, {}, open_tab);
    bv[open_tab].webContents.loadURL(url);

    win.webContents.send('change_url', {
      url: new String(url)
    });
  }

  deleteTabAll() {
    for(let index = 0; index < bv.length; index++){
      history.deleteHistoryTab(index);
      clearInterval(timer[index]);
      timer[index] = null;
      timer.splice(index, 1);
    
      win.removeBrowserView(bv[index]);
      bv[index].webContents.removeAllListeners();
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
    }

    bv = [];
  }

  getURL(index) {
    if(typeof index === 'number'){
      return bv[index].webContents.getURL();
    } else {
      return bv[open_tab].webContents.getURL();
    }
  }

  getTitle(index) {
    if(typeof index === 'number'){
      return bv[index].webContents.getTitle();
    } else {
      return bv[open_tab].webContents.getTitle();
    }
  }
}