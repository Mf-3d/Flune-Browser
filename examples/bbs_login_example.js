const { appSync, getHash } = require('../main/sync');

let browserSync;

async function login(user, password) {
  let hashData = await getHash({user, password});

  if(hashData.status === 0){
    console.log('ハッシュ化されたパスワードを取得しました。');
    browserSync = new appSync(user, hashData.hash);
    let compareData = await browserSync.compare();
    if(compareData.status === 0){
      console.log('ログインに成功しました。');
    } else {
      console.error('ハッシュ化されたパスワードでの認証中にエラーが発生しました。\n終了コードは', compareData.status, 'です。');
    }
  } else {
    console.error('ハッシュ化されたパスワードの取得中にエラーが発生しました。\n終了コードは', hashData.status, 'です。');
  }
}

login('YOUR_MF7CLI_BBS_USER_ID', 'YOUR_MF7CLI_BBS_USER_PASSWORD');