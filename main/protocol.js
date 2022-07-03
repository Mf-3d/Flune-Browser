const electron = require('electron');

module.exports = (dirname) => {
  electron.protocol.registerFileProtocol('flune', (req, callback) => {
    console.log('request URL:' + req.url);
    console.log('URL:' + req.url.slice(7));

    let url = req.url.slice(7);

    if(url === '/test'){
      electron.shell.openExternal('https://example.com');
    }
    if(url === '/setting'){
      // if(!setting_win){
      //   ns();
      // }
      // else{
      //   setting_win.close();
      //   setting_win = null;
      // }

      callback({path: `${dirname}/src/views/setting.html`});
    }
    if(url === '/about'){
      callback({path: `${dirname}/src/views/about.html`});
    }
    if(url === '/style/style.css'){
      callback({path: `${dirname}/src/style/style.css`});
    }
    if(url === '/style/style_home.css'){
      callback({path: `${dirname}/src/style/style_home.css`});
    }
    if(url === '/style/style_setting.css'){
      callback({path: `${dirname}/src/style/style_setting.css`});
    }
    if(url === '/style/light_theme.css'){
      callback({path: `${dirname}/src/style/theme/light_theme.css`});
    }
    if(url === '/style/dark_theme.css'){
      callback({path: `${dirname}/src/style/theme/dark_theme.css`});
    }
    if(url === '/settings/background'){
      callback({path: `${dirname}/src/views/image/lake-tahoe-bonsai-milky-way-rock-on-wallpaper.jpeg`});
    }
  });
}