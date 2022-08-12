const fs = require('fs');
const path = require('path');

const pluginsDir = `${__dirname}/../packs/`;

const pluginObjects = {};

module.exports = {
  init: () => {
    fs.readdirSync(pluginsDir).forEach(folder => {
      let stats = fs.statSync(`${pluginsDir}/${folder}`);

      if (stats.isDirectory()) {
        fs.readdirSync(`${pluginsDir}/${folder}`).forEach(file => {
          if (path.extname(file) !== '.json') {
            return;
          }
  
          pluginObjects[file.slice(0, -5)] = path.join(pluginsDir, folder, file);
        });
      }
    });
    console.log(pluginObjects)
  },

  load: () => {
    Object.keys(pluginObjects).forEach((pluginId) => {
      // プラグインを読み込んで
      let packMeta = JSON.parse(fs.readFileSync(pluginObjects[pluginId]));
      const plugin = require(path.join(pluginsDir, pluginId, packMeta.main));
      // filter()関数があれば実行
      if (typeof plugin.load === 'function') {
        plugin.load();
      }
    });
  }  
}
