const electron = require('electron');

module.exports = class {
    constructor(browserwindow, menu, viewY, defaultUrl) { /* コンストラクタ */
        this.browserwindow = browserwindow;
        this.menu = menu;
        this.viewY = viewY;
        this.tabindex = 0;
        this.bv = [];
        this.defaultUrl = defaultUrl;
    }

    init(browserwindow, menu, viewY) {
        this.browserwindow = browserwindow;
        this.menu = menu;
        this.viewY = viewY;
        this.winSize = this.browserwindow.getSize();
    }

    shift(array, data) {
        array.unshift(data);
    }

    create(index, width, height, path) {
        if(index === undefined){
            index = this.tabindex + 1;
        }
        this.bv[index] = new electron.BrowserView({
            width: width,
            height: height,
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
        this.bv[index].webContents.loadFile(path);
        this.browserwindow.addBrowserView(this.bv[index]);
        this.bv[index].webContents.executeJavaScript(`
            window.addEventListener('contextmenu', (e) => {
            e.preventDefault()
            window.api.show_context_menu();
            });`
        );  
        this.bv[index].setBounds({ x: 0, y: this.viewY, width: this.winSize[0], height: this.winSize[1] - this.viewY });
        this.tabindex = index;
        this.bv[index].setBackgroundColor('#ffffff');
    }

    load(index) {
        this.browserwindow.setTopBrowserView(this.bv[index]);
        this.tabindex = index;
    }

    remove(index, open_index) {
        this.bv[index].webContents.destroy();
        this.browserwindow.removeBrowserView(this.bv[index]);
        this.tabindex = open_index;

        if(open_index - 1 === -1){
            this.tabindex = 0;
            // 多分ずらしてくれる
            this.shift(this.bv, new electron.BrowserView({
                width: this.winSize[0],
                height: this.winSize[1],
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
            }));
        }

        if(this.bv[open_index] === undefined){
            this.create(open_index, this.winSize[0], this.winSize[1] - this.viewY, this.defaultUrl);
            this.menu.webContents.send('new_tab', open_index);
        }
    }
}