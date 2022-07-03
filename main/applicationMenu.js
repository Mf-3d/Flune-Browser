const electron = require('electron');
const request = require('request');
const fs = require('fs');

const isMac = (process.platform === 'darwin');

module.exports = {
  context_menu: (bv, open_tab, params) => {
    return {
      context_menu: electron.Menu.buildFromTemplate([
        {
          label: '戻る',
          click: () => {
            bv[open_tab].webContents.goBack();
          }
        },
        {
          label: '進む',
          click: () => {
            bv[open_tab].webContents.goForward();
          }
        },
        {
          type: 'separator'
        },
        {
          label:'再読み込み',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            bv[open_tab].webContents.reload();
          }
        },
        {
          label:'強制的に再読み込み',
            accelerator: 'CmdOrCtrl+Shift+R',
            click: () => {
            bv[open_tab].webContents.reloadIgnoringCache();
          }
        },
        {
          accelerator: 'F12',
          click: () => {
            bv[open_tab].webContents.toggleDevTools();
          }, label:'開発者ツールを表示'
        }
      ]),
      context_menu_link_image: electron.Menu.buildFromTemplate([
        {
          label: `新規タブで開く`,
          click: () => {
            nt(params.linkURL);
            win.webContents.send('new_tab_elm', {});
          }
        },
        {
          type: 'separator'
        },
        {
          label: '画像をコピー',
          accelerator: 'CmdOrCtrl+C',
          click: () => {
            if(params.mediaType === 'image'){
              // electron.clipboard.writeImage(electron.nativeImage.createFromDataURL(params.srcURL));
              electron.webContents.getFocusedWebContents().copyImageAt(params.x, params.y);
              console.debug('クリップボードに画像がコピーされました。\n画像URL:', params.srcURL);
            } else {
              electron.clipboard.writeText(params.selectionText, 'clipboard');
            }
          }
        },
        {
          label: '画像を保存',
          click: () => {
            if(params.mediaType === 'image'){
              // electron.clipboard.writeImage(electron.nativeImage.createFromDataURL(params.srcURL));
              // electron.webContents.getFocusedWebContents().copyImageAt(params.x, params.y);
        
              let path = electron.dialog.showSaveDialogSync(null, {
                title: '画像を保存',
                properties: ['createDirectory'],
                filters: [
                  {
                    name: '画像',
                    extensions: ['jpg','png','gif','webp']
                  }
                ]
              });
  
              if(path !== undefined){
                request(
                    {method: 'GET', url: params.srcURL, encoding: null},
                    (error, response, body) => {
                        if(!error && response.statusCode === 200){
                          console.debug('画像が保存されました。\n画像URL:', params.srcURL, '\n保存先:', path);
                          fs.writeFileSync(path, body, 'binary');
                        }
                    }
                );
              }
            } else {
              electron.clipboard.writeText(params.selectionText, 'clipboard');
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label: '戻る',
          click: () => {
            bv[open_tab].webContents.goBack();
          }
        },
        {
          label: '進む',
          click: () => {
            bv[open_tab].webContents.goForward();
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'コピー',
          accelerator: 'CmdOrCtrl+C',
          click: () => {
            if(params.mediaType === 'image'){
              // electron.clipboard.writeImage(electron.nativeImage.createFromDataURL(params.srcURL));
              electron.webContents.getFocusedWebContents().copyImageAt(params.x, params.y);
              console.debug('クリップボードに画像がコピーされました。\n画像URL:', params.srcURL);
            } else {
              electron.clipboard.writeText(params.selectionText, 'clipboard');
            }
          }
        },
        {
          label: 'ペースト',
          click: () => {
            electron.webContents.getFocusedWebContents().paste();
          }
        },
        {
          label:'切り取り',
          role:'cut'
        },
        {
          type: 'separator'
        },
        {
          label:'再読み込み',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            bv[open_tab].webContents.reload();
          }
        },
        {
          label:'強制的に再読み込み',
            accelerator: 'CmdOrCtrl+Shift+R',
            click: () => {
            bv[open_tab].webContents.reloadIgnoringCache();
          }
        },
        {
          accelerator: 'F12',
          click: () => {
            bv[open_tab].webContents.toggleDevTools();
          }, label:'開発者ツールを表示'
        }
      ]),
      context_menu_link: electron.Menu.buildFromTemplate([
        {
          label: `新規タブで開く`,
          click: () => {
            nt(params.linkURL);
            win.webContents.send('new_tab_elm', {});
          }
        },
        {
          type: 'separator'
        },
        {
          label: '戻る',
          click: () => {
            bv[open_tab].webContents.goBack();
          }
        },
        {
          label: '進む',
          click: () => {
            bv[open_tab].webContents.goForward();
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'コピー',
          accelerator: 'CmdOrCtrl+C',
          click: () => {
            if(params.mediaType === 'image'){
              // electron.clipboard.writeImage(electron.nativeImage.createFromDataURL(params.srcURL));
              electron.webContents.getFocusedWebContents().copyImageAt(params.x, params.y);
              console.debug('クリップボードに画像がコピーされました。\n画像URL:', params.srcURL);
            } else {
              electron.clipboard.writeText(params.selectionText, 'clipboard');
            }
          }
        },
        {
          label: 'ペースト',
          click: () => {
            electron.webContents.getFocusedWebContents().paste();
          }
        },
        {
          label:'切り取り',
          role:'cut'
        },
        {
          type: 'separator'
        },
        {
          label:'再読み込み',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            bv[open_tab].webContents.reload();
          }
        },
        {
          label:'強制的に再読み込み',
            accelerator: 'CmdOrCtrl+Shift+R',
            click: () => {
            bv[open_tab].webContents.reloadIgnoringCache();
          }
        },
        {
          accelerator: 'F12',
          click: () => {
            bv[open_tab].webContents.toggleDevTools();
          }, label:'開発者ツールを表示'
        }
      ]),
      context_menu_link_text: electron.Menu.buildFromTemplate([
        {
          label: `新規タブで開く`,
          click: () => {
            nt(params.linkURL);
            win.webContents.send('new_tab_elm', {});
          }
        },
        {
          label: `${params.selectionText}をGoogleで検索`,
          click: () => {
            bv[open_tab].webContents.loadURL('https://www.google.com/search?q=' + params.selectionText);
          }
        },
        {
          type: 'separator'
        },
        {
          label: '戻る',
          click: () => {
            bv[open_tab].webContents.goBack();
          }
        },
        {
          label: '進む',
          click: () => {
            bv[open_tab].webContents.goForward();
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'コピー',
          accelerator: 'CmdOrCtrl+C',
          click: () => {
            if(params.mediaType === 'image'){
              // electron.clipboard.writeImage(electron.nativeImage.createFromDataURL(params.srcURL));
              electron.webContents.getFocusedWebContents().copyImageAt(params.x, params.y);
              console.debug('クリップボードに画像がコピーされました。\n画像URL:', params.srcURL);
            } else {
              electron.clipboard.writeText(params.selectionText, 'clipboard');
            }
          }
        },
        {
          label: 'ペースト',
          click: () => {
            electron.webContents.getFocusedWebContents().paste();
          }
        },
        {
          label:'切り取り',
          role:'cut'
        },
        {
          type: 'separator'
        },
        {
          label:'再読み込み',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            bv[open_tab].webContents.reload();
          }
        },
        {
          label:'強制的に再読み込み',
            accelerator: 'CmdOrCtrl+Shift+R',
            click: () => {
            bv[open_tab].webContents.reloadIgnoringCache();
          }
        },
        {
          accelerator: 'F12',
          click: () => {
            bv[open_tab].webContents.toggleDevTools();
          }, label:'開発者ツールを表示'
        }
      ]),
      context_menu_text: electron.Menu.buildFromTemplate([
        {
          label: `${params.selectionText}をGoogleで検索`,
          click: () => {
            bv[open_tab].webContents.loadURL('https://www.google.com/search?q=' + params.selectionText);
          }
        },
        {
          type: 'separator'
        },
        {
          label: '戻る',
          click: () => {
            bv[open_tab].webContents.goBack();
          }
        },
        {
          label: '進む',
          click: () => {
            bv[open_tab].webContents.goForward();
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'コピー',
          accelerator: 'CmdOrCtrl+C',
          click: () => {
            if(params.mediaType === 'image'){
              // electron.clipboard.writeImage(electron.nativeImage.createFromDataURL(params.srcURL));
              electron.webContents.getFocusedWebContents().copyImageAt(params.x, params.y);
              console.debug('クリップボードに画像がコピーされました。\n画像URL:', params.srcURL);
            } else {
              electron.clipboard.writeText(params.selectionText, 'clipboard');
            }
          }
        },
        {
          label: 'ペースト',
          click: () => {
            electron.webContents.getFocusedWebContents().paste();
          }
        },
        {
          label:'切り取り',
          role:'cut'
        },
        {
          type: 'separator'
        },
        {
          label:'再読み込み',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            bv[open_tab].webContents.reload();
          }
        },
        {
          label:'強制的に再読み込み',
            accelerator: 'CmdOrCtrl+Shift+R',
            click: () => {
            bv[open_tab].webContents.reloadIgnoringCache();
          }
        },
        {
          accelerator: 'F12',
          click: () => {
            bv[open_tab].webContents.toggleDevTools();
          }, label:'開発者ツールを表示'
        }
      ]),
      context_menu_img: electron.Menu.buildFromTemplate([
        {
          label: '戻る',
          click: () => {
            bv[open_tab].webContents.goBack();
          }
        },
        {
          label: '進む',
          click: () => {
            bv[open_tab].webContents.goForward();
          }
        },
        {
          type: 'separator'
        },
        {
          label: '画像をコピー',
          accelerator: 'CmdOrCtrl+C',
          click: () => {
            if(params.mediaType === 'image'){
              // electron.clipboard.writeImage(electron.nativeImage.createFromDataURL(params.srcURL));
              electron.webContents.getFocusedWebContents().copyImageAt(params.x, params.y);
              console.debug('クリップボードに画像がコピーされました。\n画像URL:', params.srcURL);
            } else {
              electron.clipboard.writeText(params.selectionText, 'clipboard');
            }
          }
        },
        {
          label: '画像を保存',
          click: () => {
            if(params.mediaType === 'image'){
              // electron.clipboard.writeImage(electron.nativeImage.createFromDataURL(params.srcURL));
              electron.webContents.getFocusedWebContents().copyImageAt(params.x, params.y);
        
              let path = electron.dialog.showSaveDialogSync(null, {
                title: '画像を保存',
                properties: ['createDirectory'],
                filters: [
                  {
                    name: '画像',
                    extensions: ['jpg','png','gif','webp']
                  }
                ]
              });
  
              if(path !== undefined){
                request(
                    {method: 'GET', url: params.srcURL, encoding: null},
                    (error, response, body) => {
                        if(!error && response.statusCode === 200){
                          console.debug('画像が保存されました。\n画像URL:', params.srcURL, '\n保存先:', path);
                            fs.writeFileSync(path, body, 'binary');
                        }
                    }
                );
              }
            } else {
              electron.clipboard.writeText(params.selectionText, 'clipboard');
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label:'再読み込み',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            bv[open_tab].webContents.reload();
          }
        },
        {
          label:'強制的に再読み込み',
            accelerator: 'CmdOrCtrl+Shift+R',
            click: () => {
            bv[open_tab].webContents.reloadIgnoringCache();
          }
        },
        {
          accelerator: 'F12',
          click: () => {
            bv[open_tab].webContents.toggleDevTools();
          }, label:'開発者ツールを表示'
        }
      ])
    }
  },
  application_menu: (app, win, bv, open_tab) => {
    app.name = 'Flune-Browser';
    return electron.Menu.buildFromTemplate([
      ...(isMac ? [{
        label: app.name,
        submenu: [
          {
            label: `${app.name}について`,
            click: () => {
              electron.dialog.showMessageBox(null, {
                type: 'info',
                icon: './src/icon.png',
                title: 'Flune-Browserについて',
                message: 'Flune-Browser ' + app.getVersion(),
                detail: `Flune Browser
                    バージョン: ${app.getVersion()}
                    開発者: mf7cli
                    
                    Copyright 2022 mf7cli.`
              });
            }
          },
          { type: 'separator' },
          {
            label: 'ログの保存場所を見る',
            click: () => {
              electron.shell.openPath(log_path);
            }
          },
          // {
          //   label: '更新を確認する',
          //   click: () => {
          //     let check = electron.dialog.showMessageBoxSync(null, {
          //       type: 'info',
          //       icon: './src/icon.png',
          //       title: '更新作業の確認',
          //       message: '続行してよろしいですか？',
          //       detail: `
          //       Flune-Browserに更新がきているかチェックします。
          //       データが消える可能性もある機能なのでバックアップをお勧めします。
          //       Beta版、Dev版や開発環境で
          //       この機能を使用しないでください。
          //       バージョンがダウングレードして
          //       破損する可能性があるため危険です。
          //       続行すると別のアプリが立ち上がり、
          //       このアプリは閉じられます。
          //       よろしいですか？
          //       `,
          //       buttons: ['続行', '続行しない'],
          //       defaultId: 1
          //     });
          //     if(check === 1){
          //       if(process.platform === 'darwin'){
          //         if(!fs.existsSync(__dirname + '/Flune-Browser.app')){
          //           request('https://github.com/mf-3d/Flune-Updater/releases/tag/v1.0.0', {
          //             encoding: 'binary'
          //           }, (error, response, body) => {
          //             fs.writeFile(__dirname + '/Flune-Updater_1.0.0.zip', body, 'binary', (err) => {
          //               exec(`unzip ${__dirname}/Flune-Updater_1.0.0.zip`);
          //             });
          //           });
          //         }
          //         exec(`${__dirname}/Flune-Updater.app/Contents/MacOS/Flune-Updater "${electron.app.getVersion()}" "${__dirname}"`);
          //         process.exit(1);
          //       }
          //     }
          //   }
          // },
          { type: 'separator' },
          { role: 'services', label: 'サービス' },
          { type: 'separator' },
          { role: 'hide', label: `${app.name}を隠す` },
          { role: 'hideothers', label: 'ほかを隠す' },
          { role: 'unhide', label: 'すべて表示' },
          { type: 'separator' },
          { role: 'quit', label: `${app.name}を終了` }
        ]
      }] : []),
      {
        label: 'ファイル',
        submenu: [
          {
            label: '新しいタブ',
            click: () => {
              win.webContents.send('new_tab_elm', {});
              nt();
            },
            accelerator: 'CmdOrCtrl+N'
          },
          {
            type: 'separator'
          },
          isMac ? { role: 'close', label: 'ウィンドウを閉じる' } : { role: 'quit', label: '終了' }
        ]
      },
      {
        label: '編集',
        submenu: [
          { role: 'undo', label: '元に戻す' },
          { role: 'redo', label: 'やり直す' },
          { type: 'separator' },
          { role: 'cut', label: '切り取り' },
          {
            label: 'コピー',
            role: 'copy'
          },
          { role: 'paste', label: '貼り付け' },
          ...(isMac ? [
            { role: 'pasteAndMatchStyle', label: 'ペーストしてスタイルを合わせる' },
            { role: 'delete', label: '削除' },
            { role: 'selectAll', label: 'すべてを選択' },
            { type: 'separator' },
            {
              label: 'スピーチ',
              submenu: [
                { role: 'startSpeaking', label: '読み上げを開始' },
                { role: 'stopSpeaking', label: '読み上げを停止' }
              ]
            }
          ] : [
            { role: 'delete', label: '削除' },
            { type: 'separator' },
            { role: 'selectAll', label: 'すべてを選択' }
          ])
        ]
      },
      {
        label: '表示',
        submenu: [
          {
            label: '再読み込み',
            accelerator: 'CmdOrCtrl+R',
            click: () => {
              bv[open_tab].webContents.reload();
            }
          },
          {
            label: '強制的に再読み込み',
            accelerator: 'CmdOrCtrl+Shift+R',
            click: () => {
              bv[open_tab].webContents.reloadIgnoringCache();
            }
          },
          {
            accelerator: 'F12',
            click: () => {
              bv[open_tab].webContents.toggleDevTools();
            }, label: '開発者ツールを表示'
          },
          { type: 'separator' },
          { role: 'resetZoom', label: '実際のサイズ' },
          {
            label: '拡大',
            accelerator: 'CmdOrCtrl+Plus',
            click: () => {
              bv[open_tab].webContents.setZoomLevel(bv[open_tab].webContents.getZoomLevel() + 1);
            }
          },
          {
            label: '縮小',
            accelerator: 'CmdOrCtrl+-',
            click: () => {
              bv[open_tab].webContents.setZoomLevel(bv[open_tab].webContents.getZoomLevel() - 1);
            }
          },
          { type: 'separator' },
          { role: 'togglefullscreen', label: 'フルスクリーン' }
        ]
      },
      {
        label: 'ウィンドウ',
        submenu: [
          { role: 'minimize', label: '最小化' },
          { role: 'zoom', label: 'ズーム' },
          ...(isMac ? [
            { type: 'separator' },
            { role: 'front', label: 'ウィンドウを手前に表示' },
            { type: 'separator' },
            { role: 'window', label: 'ウィンドウ' }
          ] : [
            { role: 'close', label: '閉じる' }
          ])
        ]
      },
      {
        label: 'ヘルプ',
        submenu: [
          {
            label: `${app.name} ヘルプ`, click: () => {
              electron.shell.openExternal('https://twitter.com/made_in_apple_');
            }
          },
          ...(isMac ? [] : [
            { type: 'separator' },
            { role: 'about', label: `${app.name}について` }
          ])
        ]
      }
    ]);
  },
  get applicationMenu() {
    return this._applicationMenu;
  },
  set applicationMenu(value) {
    this._applicationMenu = value;
  },
}