const request = require('request');

module.exports = class {
  constructor(user, password, setting) {
    this.account = {};
    this.account.user = user;
    this.account.password = password;
    this.account.setting = setting;
  }

  compare() {
    if(!this.account.user || !this.account.password) return;
    let status = {};
    request({
      url: 'https://bbs.mf7cli.potp.me/api/v1/compare',
      method: 'POST',
      form: {
        submit_id: [this.account.user, this.account.password]
      }
    }, (error, response, body) => {
      status = body;
    });

    return status;
  }

  addData(path, data) {
    if(!this.account.user || !this.account.password) return;
    let status = {};
    request({
      url: 'https://bbs.mf7cli.potp.me/api/v1/user/data/add',
      method: 'POST',
      form: {
        submit_id: [this.account.user, this.account.password],
        data: {
          name: path,
          data
        }
      }
    }, (error, response, body) => {
      status = body;
    });

    return status;
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