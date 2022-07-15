const electron = require('electron');

const touchBarItem_reload = new electron.TouchBar.TouchBarButton({
  label: '↻',
  click: () => {
    bv[open_tab].webContents.reload();
    setTitle(open_tab);
  }
});

const touchBarItem_BackForward = new electron.TouchBar.TouchBarSegmentedControl({
  mode: 'buttons',
  segments: [
    {
      label: '◀︎',
    },
    {
      label: '▶︎'
    }
  ],
  change: (selectedIndex, isSelected) => {
    if(isSelected){
      if(selectedIndex === 0){
        bv[open_tab].webContents.goBack();
        setTitle(open_tab);
      }
      else if(selectedIndex === 1){
        bv[open_tab].webContents.goForward();
        setTitle(open_tab);
      }
    }
  }
});

/** 
 * @deprecated This feature has already been removed.
 */
const touchBar = new electron.TouchBar({
  items: [
    // new electron.TouchBar.TouchBarGroup({
    //   items: new electron.TouchBar({
    //     items: [
    //       touchBarItem_back,
    //       touchBarItem_forward
    //     ]
    //   })
    // }),
    touchBarItem_BackForward,
    touchBarItem_reload,
    new electron.TouchBar.TouchBarButton({
      label: ' 検索するURLまたは語句を入力        ',
      click: () => {
        win.webContents.send('openSearchInput');
      }
    }),
    new electron.TouchBar.TouchBarButton({
      label: '＋',
      click: () => {
        win.webContents.send('new_tab_elm', {});
        nt();
      }
    })
  ]
});

module.exports = touchBar;