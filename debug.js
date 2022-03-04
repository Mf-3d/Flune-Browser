const electron = require('electron');
var developer_window;

var date = new Date();

module.exports = class {
    // constructor () {
    // }
    init () {
        developer_window = new electron.BrowserWindow({
            width: 800,
            height: 400,
            minWidth: 400, 
            minHeight: 200,
            icon: `${__dirname}/icon.png`,
            toolbar: false,
            title: 'Flune Browser',
            background: '#ffffff',
            transparent: false,
            show: false,
            webPreferences: {
              preload: `${__dirname}/src/preload.js`,
            }
        });

        developer_window.webContents.loadFile(__dirname + '/src/resource/debugger.html');
        developer_window.webContents.executeJavaScript(`
          window.addEventListener('contextmenu', (e) => {
            e.preventDefault()
            window.api.show_context_menu();
          });`
        );
    }

    show () {
        developer_window.show();
    }

    hide () {
        developer_window.hide();
    }

    log (msg) {
        developer_window.webContents.executeJavaScript(`
            document.getElementById('log').innerHTML = \`
            \${document.getElementById('log').innerHTML}
            <li>${msg} | ${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()} ${date.getSeconds()}s</li>
            \`
        `);
    }
}