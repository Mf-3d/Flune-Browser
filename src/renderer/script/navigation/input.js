// --検索バー

export function registerInputEvents() {
  window.addEventListener("load", () => {
    const input = document.getElementById("search-bar");
    let originalValue = ""; // 検索バーの変更前の値
    let isDirty = false;    // 検索バーが変更されているか

    input.addEventListener("keydown", (event) => {
      if (!event.isComposing && event.key === "Enter") {
        search();
      }
    });

    // フォーカスされたら、値が変更されることを想定して事前に記憶しておく。
    input.addEventListener("focus", () => {
      originalValue = input.value;
      isDirty = false;
    });

    // 変更されていたらフラグを立てる。
    input.addEventListener("input", () => {
      isDirty = input.value !== originalValue;
    });

    // Escには２段階ある。
    input.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;

      if (isDirty) {
        // 1回目：入力を元に戻す
        input.value = originalValue;
        isDirty = false;
        e.preventDefault();
        return;
      }

      // 2回目：抜ける
      flune.focusPage();
      e.preventDefault();
    });

    // メイン側から値を代入するように指示される。
    flune.on("nav.set-word", (event, word) => {
      if(word === `${flune.baseURL}home`) word = "";
      console.info("(nav.set-word):", word);
      input.value = word;
    });

    flune.on("flune.focus-search-bar", () => {
      input.focus();
    });

    function search() {
      const activeTab = document.querySelector("#tabs > #opened");
      flune.load(activeTab.getAttribute("data-id"), input.value);
      input.value = ""; // ロードされたらすぐに値が代入されるが、念のため一度リセットする。
      input.blur();
    }

    window.search = search;
  });
}