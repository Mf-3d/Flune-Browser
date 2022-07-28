const request = require('request');

module.exports = class {
  constructor(user, password, setting) {
    this.account = {};
    this.account.user = user;
    this.account.password = password;
    this.account.setting = setting;
  }

  async compare() {
    if(!this.account.user || !this.account.password) return;
    const rqt = (url) => {
      return new Promise((resolve, reject)=> {
        request(url, {
          method: 'POST',
          form: {
            submit_id: [this.account.user, this.account.password]
          }
        }, (error, response, body)=> {
          resolve(body);
        });
      });
    }

    let body = await rqt('https://bbs.mf7cli.potp.me/api/v1/compare');
    return body;
  }

  async addData(path, data) {
    if(!this.account.user || !this.account.password) return;
    const rqt = (url) => {
      return new Promise((resolve, reject)=> {
        request(url, {
          method: 'POST',
          form: {
            submit_id: [this.account.user, this.account.password],
            data: {
              name: path,
              data
            }
          }
        }, (error, response, body)=> {
          resolve(body);
        });
      });
    }

    let body = await rqt('https://bbs.mf7cli.potp.me/api/v1/user/data/add');
    return body;
  }

  deleteData(path, data) {
    // if(!this.account.user || !this.account.password) return;
    // let status = {};
    // request({
    //   url: 'https://bbs.mf7cli.potp.me/api/v1/user/data/delete',
    //   method: 'POST',
    //   form: {
    //     submit_id: [this.account.user, this.account.password],
    //     data: {
    //       name: path
    //     }
    //   }
    // }, (error, response, body) => {
    //   status = body;
    // });

    // return status;
  }

  getData(path) {
  //   let status = {};
  //   request({
  //     url: 'https://bbs.mf7cli.potp.me/api/v1/user/data/get',
  //     method: 'POST',
  //     form: {
  //       submit_id: [this.account.user, this.account.password],
  //       data: {
  //         name: path
  //       }
  //     }
  //   }, (error, response, body) => {
  //     status = body;
  //   });

  //   return status;
  }
}