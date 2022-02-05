var index = 0;
each();
const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function moveview(){
  window.api.open_url(document.getElementById('url').value);
}
function movehome(){
  window.api.open_home();
}
function close(){
  window.api.close();
}
function maximize(){
  window.api.maximize();
}
function minimize(){
  window.api.minimize();
}
function maxmin(){
  window.api.maxmin();
}
function pageback(){
  window.api.pageback();
}
function pageforward(){
  window.api.pageforward();
}

// Monotから盗人ブルートしてきた
function getCurrent(){
  //source: https://lab.syncer.jp/Web/JavaScript/Snippet/54/
  let el=document.getElementsByTagName('span');
  el=[].slice.call(el);
  return el.indexOf(document.getElementById('opened'));
}

document.getElementById('tabs').addEventListener('click', () => {
  if(!document.getElementById('opened')){
    try{
      window.api.open_tab(index);
    }
    catch(e){
      newtab('Home');
    }
  }
});
      
window.api.on('page_changed', async (event, data) => {
  await _sleep(1000);
  let url = await window.api.bv_url();
  console.log(url)
  if(url.match('https://')){
    document.getElementById('secrity_icon').style.color = '#00ff00';
    document.getElementById('secrity_icon').innerHTML = '☺';
  }
  if(url.match('http://')){
    document.getElementById('secrity_icon').style.color = '#ffffff';
    document.getElementById('secrity_icon').innerHTML = '☹';
  }
  if(url.match('file://')){
    document.getElementById('secrity_icon').style.color = '#0000ff';
    document.getElementById('secrity_icon').innerHTML = '❐';
  }
});

window.api.on('newtab', async (event, data) => {
  console.log('タブ作るね')
  newtab('Home');
});

window.onload = () => {
  if(window.location.href.match('https://')){
    document.getElementById('secrity_icon').style.color = '#ffffff';
    document.getElementById('secrity_icon').innerHTML = '☺';
  }
  if(window.location.href.match('http://')){
    document.getElementById('secrity_icon').style.color = '#00ff00';
    document.getElementById('secrity_icon').innerHTML = '☹';
  }
  if(window.location.href.match('file://')){
    document.getElementById('secrity_icon').style.color = '#0000ff';
    document.getElementById('secrity_icon').innerHTML = '❐';
  }
}

// Monotから盗人ブルートしてきた
function each(){
  // when close button clicked
  document.querySelectorAll('div>span>a:last-child').forEach((i, item)=>{
    i.addEventListener('click',()=>{
      i.parentNode.remove();
      window.api.remove_tab(getCurrent());
      console.log('Tab Remove.')
    })
  })
  document.querySelectorAll('div>span').forEach((i, item)=>{
    //when tab-bar clicked
    i.addEventListener('click',()=>{
      //remove #opened's id(Opened)
      if(document.getElementById('opened')){
        document.getElementById('opened').removeAttribute('id');
      }
      //clicked tab
      i.setAttribute('id','opened')
      window.api.tab_move(getCurrent());
    })
  })
}

// Monotから盗人ブルートしてきた
function newtab(title){
  if(document.getElementById('opened')){
    document.getElementById('opened').removeAttribute('id')
  }
  document.getElementsByTagName('div')[0].innerHTML=`
    ${document.getElementsByTagName('div')[0].innerHTML}
    <span id="opened">
      <a href="javascript:void(0)">${title}</a>
      <a href="javascript:void(0)">×</a>
    </span>
  `;
  each();
  window.api.new_tab(getCurrent());
}
