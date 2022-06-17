function getOpenTabIndex() {
  let el = document.querySelector("#tabs");
  el = [].slice.call(el);
  return el.indexOf(document.querySelector("#active"));
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

function search() {
  window.flune_api.searchURL(document.querySelector("#address_bar").value);
  document.querySelector("#address_bar").value = "";
}

window.onload = () => {
  document.addEventListener('keydown', (e) => {
    if (e.target === document.getElementById('address_bar')) {
      const word = document.getElementsByTagName('input')[0].value;
      if (!e.isComposing && e.key === 'Enter' && word != null) {
        search();
      }
    }
  });

  document.querySelector("#new_tab").addEventListener("click", (event) => {
    if(document.querySelector("#active")){
      document.querySelector("#active").removeAttribute("id");
    }

    document.querySelector("#tabs > span").innerHTML = `
    ${document.querySelector("#tabs > span").innerHTML}
    <div id="active"><a class="title">読み込み中…</a><a class="close_button">×</a></div>
    `;

    window.flune_api.new_tab();

    each();
  });

  window.flune_api.on('new_tab_elm', () => {
    if(document.querySelector("#active")){
      document.querySelector("#active").removeAttribute("id");
    }
  
    document.querySelector("#tabs > span").innerHTML = `
    ${document.querySelector("#tabs > span").innerHTML}
    <div id="active"><a class="title">読み込み中…</a><a class="close_button">×</a></div>
    `;
  
    each();
  });

  function each() {
    let el = document.querySelectorAll("#tabs > span > div");
    el.forEach((val, index) => {
      val.querySelector(".close_button").onclick = () => {
        val.remove();
        
        window.flune_api.close_tab(index);
        el[index - 1].setAttribute('id','active');

        each();

        return;
      };

      val.onclick = (event) => {
        if(document.querySelector("#active")){
          document.querySelector("#active").removeAttribute("id");
        }
        
        val.setAttribute('id','active');
  
        window.flune_api.open_tab(index);
      };
    });
  }

  each();
}

window.flune_api.on('change_url', (event, data)=>{
  document.querySelector("#address_bar").value = data.url;
});

window.flune_api.on('change_title', (event, data)=>{
  document.querySelectorAll("#tabs > span > div > .title")[data.index].innerHTML = data.title;
});

window.flune_api.on('active_tab', (event, data)=>{
  if(document.querySelector("#active")){
    document.querySelector("#active").removeAttribute("id");
  }
  
  document.querySelectorAll("#tabs > span > div")[data.index].setAttribute('id','active');
});