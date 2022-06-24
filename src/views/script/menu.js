let setting;

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
  setting = await window.flune_api.get_setting();

  document.getElementById('theme').href = await window.flune_api.theme_path();

  document.addEventListener('keydown', (e) => {
    if (e.target === document.getElementById('address_bar')) {
      const word = document.getElementsByTagName('input')[0].value;
      if (!e.isComposing && e.key === 'Enter' && word != null) {
        search();
      }
    }
  });

  document.querySelector("#new_tab").addEventListener("click", (event) => {
    if(document.querySelector("#tabs > span > div.active")){
      document.querySelector("#tabs > span > div.active").classList.remove('active');
    }

    document.querySelector("#tabs > span").innerHTML = `
    ${document.querySelector("#tabs > span").innerHTML}
    <div class="active"><a class="loading"><i class="fa-solid fa-circle-notch"></i><a class="title">読み込み中…</a><a class="audible"><i class="fa-solid fa-volume-high"></i></a><a class="close_button">×</a></div>
    `;

    window.flune_api.new_tab();

    each();
  });

  window.flune_api.on('new_tab_elm', () => {
    if(document.querySelector("#tabs > span > div.active")){
      document.querySelector("#tabs > span > div.active").classList.remove('active');
    }
  
    document.querySelector("#tabs > span").innerHTML = `
    ${document.querySelector("#tabs > span").innerHTML}
    <div class="active"><a class="loading"><i class="fa-solid fa-circle-notch"></i><a class="title">読み込み中…</a><a class="audible"><i class="fa-solid fa-volume-high"></i></a><a class="close_button">×</a></div>
    `;
  
    each();
  });

  function each() {
    let el = document.querySelectorAll("#tabs > span > div");
    el.forEach((val, index) => {
      val.querySelector(".title").onclick = (event) => {
        if(document.querySelector("#tabs > span > div.active")){
          document.querySelector("#tabs > span > div.active").classList.remove('active');
        }
        
        val.classList.add('active');
  
        window.flune_api.open_tab(index);

        each();

        if(setting.force_twemoji){
          twemoji.parse(document.body);
        }

        return;
      };

      val.querySelector(".close_button").onclick = () => {
        if(document.querySelector("#tabs > span > div.active")){
          document.querySelector("#tabs > span > div.active").classList.remove('active');
        }

        val.remove();

        let open_index;

        window.flune_api.close_tab(index);

        if(index === 0 && el.length !== 0){
          open_index = index;
          index = index + 1;
        }
        else{
          open_index = index - 1;
          index = index - 1;
        }

        window.flune_api.open_tab(open_index);

        each();

        el[index].classList.add('active');
        

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
  document.querySelectorAll("#tabs > span > div > .title")[data.index].innerHTML = data.title;
  if(setting.force_twemoji){
    twemoji.parse(document.body);
  }
});

window.flune_api.on('active_tab', (event, data)=>{
  if(document.querySelector(".active")){
    document.querySelector(".active").classList.remove('active');
  }
  
  document.querySelectorAll("#tabs > span > div")[data.index].classList.add('active');
});

window.flune_api.on('update-audible', (event, data) => {
  if(data.audible){
    document.querySelectorAll("#tabs > span > div")[data.index].getElementsByClassName('audible')[0].classList.add('active');
  }
  else{
    document.querySelectorAll("#tabs > span > div")[data.index].getElementsByClassName('audible')[0].classList.remove('active');
  }
});

window.flune_api.on('update-loading', (event, data) => {
  if(data.loading){
    document.querySelectorAll("#tabs > span > div")[data.index].getElementsByClassName('loading')[0].classList.add('active');
  }
  else{
    document.querySelectorAll("#tabs > span > div")[data.index].getElementsByClassName('loading')[0].classList.remove('active');
  }
});