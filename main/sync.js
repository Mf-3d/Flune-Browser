const request = require('request');

module.exports = {
  async getHash(account = {user, password}) {
    if(!account.user || !account.password) return;
    const rqt = (url) => {
      return new Promise((resolve, reject)=> {
        request(url, {
          method: 'POST',
          form: {
            submit_id: [account.user, account.password]
          }
        }, (error, response, body)=> {
          resolve(body);
        });
      });
    }

    let body = await rqt('https://bbs.mf7cli.potp.me/api/v1/getHash');
    return body;
  },
  
  appSync: class {
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

    async deleteData(path, data) {
      if(!this.account.user || !this.account.password) return;
      const rqt = (url) => {
        return new Promise((resolve, reject)=> {
          request(url, {
            method: 'POST',
            form: {
              submit_id: [this.account.user, this.account.password],
              data: {
                name: path
              }
            }
          }, (error, response, body)=> {
            resolve(body);
          });
        });
      }

      let body = await rqt('https://bbs.mf7cli.potp.me/api/v1/user/data/delete');
      return body;
    }

    async getData(path) {
    if(!this.account.user || !this.account.password) return;
      const rqt = (url) => {
        return new Promise((resolve, reject)=> {
          request(url, {
            method: 'POST',
            form: {
              submit_id: [this.account.user, this.account.password],
              data: {
                name: path
              }
            }
          }, (error, response, body)=> {
            resolve(body);
          });
        });
      }

      let body = await rqt('https://bbs.mf7cli.potp.me/api/v1/user/data/get');
      return body;
    }
  }
}