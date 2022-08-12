const RPC = require('discord-rpc');

module.exports = {
  load() {
    RPC.register('1002944142701252680');

    const client = new RPC.Client({ transport: 'ipc' });

    client.on('ready', () => {
      let startTimestamp = new Date();
      client.setActivity({
        smallImageKey: 'icon',
        // smallImageText: '',
        details: 'Webを探索中…',
        startTimestamp
      });
    });

    client.login({clientId:'1002944142701252680'});
  }
}