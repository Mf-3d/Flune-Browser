const electron = require('electron');
const urlParser = require('../lib/urlParser');
const Store = require('electron-store');
const store = new Store();
/** 
 * Protocol settings.
 * @author mf7cli
 * @param {string} dirname
 */
module.exports = (dirname) => {
  electron.protocol.registerFileProtocol('flune', (req, callback) => {
    console.log('request URL:' + req.url);
    console.log('URL:' + req.url.slice(7));

    let url = req.url.slice(7);

    if(url === '/test'){
      electron.shell.openExternal('https://example.com');
    }
    else if(url === '/setting'){
      // if(!setting_win){
      //   ns();
      // }
      // else{
      //   setting_win.close();
      //   setting_win = null;
      // }

      callback({path: `${dirname}/src/views/setting.html`});
    }
    else if(url === '/about'){
      callback({path: `${dirname}/src/views/about.html`});
    }
    else if(url === '/style/style.css'){
      callback({path: `${dirname}/src/style/style.css`});
    }
    else if(url === '/style/style_home.css'){
      callback({path: `${dirname}/src/style/style_home.css`});
    }
    else if(url === '/style/style_setting.css'){
      callback({path: `${dirname}/src/style/style_setting.css`});
    }
    else if(url === '/style/light_theme.css'){
      callback({path: `${dirname}/src/style/theme/light_theme.css`});
    }
    else if(url === '/style/dark_theme.css'){
      callback({path: `${dirname}/src/style/theme/dark_theme.css`});
    }
    else if(url === '/style/light_theme_stylish.css'){
      callback({path: `${dirname}/src/style/theme/light_theme_stylish.css`});
    }
    else if(url === '/settings/background'){
      callback({path: `${dirname}/src/views/image/lake-tahoe-bonsai-milky-way-rock-on-wallpaper.jpeg`});
    }
    else if(url === '/sidebar'){
      callback({path: `${dirname}/src/views/sidebar.html`});
    } 
    else if(url.slice(0, 6) === '/login') {
      store.set('syncAccount.user', urlParser.getParam('user', url));
      store.set('syncAccount.password', urlParser.getParam('password', url));
      callback({path: `${dirname}/src/views/err/unknown.html`});
    } else {
      callback({path: `${dirname}/src/views/home.html`});
    }
  });
}