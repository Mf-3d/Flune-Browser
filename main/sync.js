const request = require('sync-request');

module.exports = class {
  constructor(user, password, setting) {
    this.account = {};
    this.account.user = user;
    this.account.password = password;
    this.account.setting = setting;
  }

  compare() {
    if(!this.account.user || !this.account.password) return;

    let res = request('POST', 'https://bbs.mf7cli.potp.me/api/v1/compare', {
      json: {
        submit_id: [this.account.user, this.account.password]
      }
    });

    return res.getBody('utf8');
  }

  addData(path, data) {
    if(!this.account.user || !this.account.password) return;
    let res = request('POST', 'https://bbs.mf7cli.potp.me/api/v1/user/data/add', {
      json: {
        submit_id: [this.account.user, this.account.password],
        data: {
          name: path,
          data
        }
      }
    });

    return res.getBody('utf8');
  }

  deleteData(path, data) {
    if(!this.account.user || !this.account.password) return;
    let status = {};
    request({
      url: 'https://bbs.mf7cli.potp.me/api/v1/user/data/delete',
      method: 'POST',
      form: {
        submit_id: [this.account.user, this.account.password],
        data: {
          name: path
        }
      }
    }, (error, response, body) => {
      status = body;
    });

    return status;
  }

  getData(path) {
    let status = {};
    request({
      url: 'https://bbs.mf7cli.potp.me/api/v1/user/data/get',
      method: 'POST',
      form: {
        submit_id: [this.account.user, this.account.password],
        data: {
          name: path
        }
      }
    }, (error, response, body) => {
      status = body;
    });

    return status;
  }
}