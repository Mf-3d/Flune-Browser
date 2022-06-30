let setting;
let faviconCache;
let timer = [];

function getOpenTabIndex() {
  let el = document.querySelector("#tabs");
  el = [].slice.call(el);
  return el.indexOf(document.querySelector("#active"));
}

function addBookmark() {
  if(!document.getElementById('bookmark').classList.contains('active')){
    document.getElementById('bookmark').classList.add('active');
    window.flune_api.addBookmark();
  }
  else{
    document.getElementById('bookmark').classList.remove('active')
    window.flune_api.removeBookmark();
  }
}

function go_back() {
  window.flune_api.go_back();
}

function go_forward() {
  window.flune_api.go_forward();
}

function reload() {
  window.flune_api.reload();
}

function toggle_setting() {
  window.flune_api.toggle_setting();
}

function search() {
  window.flune_api.searchURL(document.querySelector("#address_bar").value);
  document.querySelector("#address_bar").value = "";
}

function more_button() {
  window.flune_api.more_button_menu();
}

window.onload = async () => {
  window.flune_api.on('openSearchInput', (event) => {
    document.getElementById("address_bar").focus();
  });
  
  setting = await window.flune_api.get_setting();

  document.getElementById('theme').href = await window.flune_api.theme_path();

  document.querySelector("#address_bar").addEventListener('input', async (event) => {
    console.log([document.querySelector("#address_bar").getBoundingClientRect().left, document.querySelector("#address_bar").getBoundingClientRect().bottom]);
    window.flune_api.viewSuggest({
      word: document.querySelector("#address_bar").value,
      pos: [document.querySelector("#address_bar").getBoundingClientRect().left, document.querySelector("#address_bar").getBoundingClientRect().bottom]
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.target === document.getElementById('address_bar')) {
      const word = document.getElementsByTagName('input')[0].value;
      if (!e.isComposing && e.key === 'Enter' && word != null) {
        search();
      }
    }
  });

  document.getElementById('address_bar').oncontextmenu = (event) => {
    event.preventDefault();
    window.flune_api.context();
  }

  document.querySelector("#new_tab").addEventListener("click", (event) => {
    if(document.querySelector("#tabs > span > div.active")){
      document.querySelector("#tabs > span > div.active").classList.remove('active');
    }

    document.querySelector("#tabs > span").innerHTML = `
    ${document.querySelector("#tabs > span").innerHTML}
    <div class="active" tab_id="${document.querySelectorAll("#tabs > span > div").length}" draggable="true"><img src="" class="favicon"/><a class="loading"><i class="fa-solid fa-circle-notch"></i><a class="title">読み込み中…</a><a class="audible"><i class="fa-solid fa-volume-high"></i></a><a class="close_button">×</a></div>
    `;

    window.flune_api.new_tab();

    each();
  });

  window.flune_api.on('new_tab_elm', (event, data) => {
    if(document.querySelector("#tabs > span > div.active")){
      document.querySelector("#tabs > span > div.active").classList.remove('active');
    }
  
    document.querySelector("#tabs > span").innerHTML = `
    ${document.querySelector("#tabs > span").innerHTML}
    <div class="active" tab_id="${document.querySelectorAll("#tabs > span > div").length}" draggable="true"><img src="" class="favicon"/><a class="loading"><i class="fa-solid fa-circle-notch"></i><a class="title">読み込み中…</a><a class="audible"><i class="fa-solid fa-volume-high"></i></a><a class="close_button">×</a></div>
    `;
  
    each();
  });

  function each() {
    let el = document.querySelectorAll("#tabs > span > div");
    el.forEach((val, index) => {
      val.querySelector(".title").onclick = (event) => {
        let _index = Number(document.querySelectorAll("#tabs > span > div")[index].getAttribute('tab_id'));
        if(document.querySelector("#tabs > span > div.active")){
          document.querySelector("#tabs > span > div.active").classList.remove('active');
        }
        
        val.classList.add('active');
  
        window.flune_api.open_tab(_index);

        each();

        if(setting.force_twemoji){
          twemoji.parse(document.body);
        }

        return;
      };

    val.ondragstart = function () {
      event.dataTransfer.setData('text/plain', event.target.getAttribute('tab_id'));
    };

    val.ondragover = function () {
      event.preventDefault();
      let rect = this.getBoundingClientRect();
      if ((event.clientX - rect.left) < (this.clientWidth / 2)) {
        //マウスカーソルの位置が要素の半分より上
        this.style.borderLeft = '3px solid blue';
        this.style.borderRight = '';
      } else {
        //マウスカーソルの位置が要素の半分より下
        this.style.borderLeft = '';
        this.style.borderRight = '3px solid blue';
      }
    };

    val.ondragleave = function () {
      this.style = '';
    };

    val.ondrop = function () {
      event.preventDefault();
      let id = event.dataTransfer.getData('text/plain');
      let elm_drag = document.querySelector('#tabs > span > div[tab_id="' + id + '"]')

      console.log(elm_drag);

      let rect = this.getBoundingClientRect();
      if ((event.clientX - rect.left) < (this.clientWidth / 2)) {
        //マウスカーソルの位置が要素の半分より上
        // this.parentNode.insertBefore(elm_drag, this);
        val.insertAdjacentElement('beforebegin', elm_drag);
      } else {
        //マウスカーソルの位置が要素の半分より下
        // this.parentNode.insertBefore(elm_drag, this.nextSibling);
        val.insertAdjacentElement('afterend', elm_drag);
      }
      
      document.querySelectorAll('#tabs > span > div').forEach((val, index) => {
        val.style = '';
      });

      let _index = Number(document.querySelectorAll("#tabs > span > div")[index].getAttribute('tab_id'));
      // window.flune_api.open_tab(_index);

      each();
    };

      val.querySelector(".close_button").onclick = () => {
        let _index = Number(document.querySelectorAll("#tabs > span > div")[index].getAttribute('tab_id'));
        if(document.querySelector("#tabs > span > div.active")){
          document.querySelector("#tabs > span > div.active").classList.remove('active');
        }

        val.remove();

        let open_index;

        window.flune_api.close_tab(_index);

        document.querySelectorAll(`#tabs > span > div`).forEach((val, index) => {
          if(_index < Number(val.getAttribute('tab_id'))){
            val.setAttribute('tab_id', Number(val.getAttribute('tab_id')) - 1);
          }
        });

        if(index === 0){
          open_index = index;
          index = index;
        }
        else{
          open_index = index - 1;
          index = index - 1;
        }

        if(document.querySelectorAll('#tabs > span > div').length !== 0){
          window.flune_api.open_tab(open_index);
          each();
        }



        document.querySelector(`#tabs > span > div[tab_id="${open_index}"]`).classList.add('active');

        if(setting.force_twemoji){
          twemoji.parse(document.body);
        }

        return;
      };
    });
  }

  window.flune_api.on('each', (event, data)=>{
    each();
  });

  window.flune_api.on('change_theme', async (event, data)=>{
    document.getElementById('theme').href = await window.flune_api.theme_path();
    setting = await window.flune_api.get_setting();
  });

  if(setting.auto_theme){
    setInterval(() => {
      if(window.matchMedia('(prefers-color-scheme: dark)').matches){
        document.getElementById('theme').href = '../style/theme/dark_theme.css';
        reload();
      }
      else{
        document.getElementById('theme').href = '../style/theme/light_theme.css';
        reload();
      }
    }, 10000);
  }
  else{
    document.getElementById('theme').href = await window.flune_api.theme_path();
  }


  each();
}

window.flune_api.on('activeBookmark', async (event, data) => {
  if(data === true){
    document.getElementById('bookmark').classList.add('active');
  }
  else{
    document.getElementById('bookmark').classList.remove('active');
  }
});

window.flune_api.on('change_url', (event, data)=>{
  document.querySelector("#address_bar").value = data.url;
});

window.flune_api.on('change_title', (event, data)=>{
  document.querySelector(`#tabs > span > div[tab_id="${data.index}"] > .title`).innerHTML = data.title;
  if(setting.force_twemoji){
    twemoji.parse(document.body);
  }
});

window.flune_api.on('change-favicon', (event, data)=>{
  if(!data.favicon){
    data.favicon = '';
  }
  clearInterval(timer[data.index]);
  timer[data.index] = setInterval(() => {
    if(document.querySelector(`#tabs > span > div[tab_id="${data.index}"]`).getElementsByClassName('loading')[0].classList.contains('active')){
      document.querySelector(`#tabs > span > div[tab_id="${data.index}"] > .favicon`).src = '';
      return;
    }
    document.querySelector(`#tabs > span > div[tab_id="${data.index}"] > .favicon`).src = data.favicon;
  }, 500);

  document.querySelector(`#tabs > span > div[tab_id="${data.index}"] > .favicon`).src = data.favicon;
  faviconCache[data.index] = data.favicon;
  if(setting.force_twemoji){
    twemoji.parse(document.body);
  }
});

window.flune_api.on('active_tab', (event, data)=>{
  if(document.querySelector("#tabs > span > div.active")){
    document.querySelector("#tabs > span > div.active").classList.remove('active');
  }
  
  document.querySelector(`#tabs > span > div[tab_id="${data.index}"]`).classList.add('active');
});

window.flune_api.on('update-audible', (event, data) => {
  if(data.audible){
    document.querySelector(`#tabs > span > div[tab_id="${data.index}"]`).getElementsByClassName('audible')[0].classList.add('active');
  }
  else{
    document.querySelector(`#tabs > span > div[tab_id="${data.index}"]`).getElementsByClassName('audible')[0].classList.remove('active');
  }
});

window.flune_api.on('update-loading', (event, data) => {
  if(data.loading === true){
    faviconCache = document.querySelector(`#tabs > span > div[tab_id="${data.index}"] > .favicon`).src;
    document.querySelector(`#tabs > span > div[tab_id="${data.index}"] > .favicon`).src = '';
    document.querySelector(`#tabs > span > div[tab_id="${data.index}"]`).getElementsByClassName('loading')[0].classList.add('active');
  }
  else{
    document.querySelector(`#tabs > span > div[tab_id="${data.index}"] > .favicon`).src = faviconCache[data.index];
    document.querySelector(`#tabs > span > div[tab_id="${data.index}"]`).getElementsByClassName('loading')[0].classList.remove('active');
  }
});

function close() {
  window.flune_api.close();
}

function maxmin_min() {
  window.flune_api.maxmin_win();
}

function hide_min() {
  window.flune_api.hide_win();
}