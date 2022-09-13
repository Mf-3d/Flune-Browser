/** 
 * @param {string} name Query name
 * @param {string} url URL
 */
function getParam(name,url){
  // パラメータを格納する用の配列を用意
  var paramArray = [];

  // URLにパラメータが存在する場合
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';

  //パラメータを返す
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

module.exports = {
  getParam
}