import { navigationActions } from "../actions/navigation-actions";

export function registerInputEvents() {
  if (!window.flune.navigation) return;

  const input = document.querySelector("#search-bar")! as HTMLElement;
  let originalValue = ""; // 検索バーの変更前の値
  let isDirty = false; // 検索バーが変更されているか

  input.addEventListener("keydown", (event: KeyboardEvent) => {
    if (!event.isComposing && event.key === "Enter") {
      navigationActions.search();
    }
  });

  // フォーカスされたら、値が変更されることを想定して事前に記憶しておく。
  input.addEventListener("focus", () => {
    originalValue = input.getAttribute("value")!;
    isDirty = false;
  });

  // 変更されていたらフラグを立てる。
  input.addEventListener("input", () => {
    isDirty = input.getAttribute("value") !== originalValue;
  });

  // Escには２段階ある。
  input.addEventListener("keydown", (event: KeyboardEvent) => {
    if (!window.flune.navigation) return;

    if (event.key !== "Escape") return;

    if (isDirty) {
      // 1回目：入力を元に戻す
      input.setAttribute("value", originalValue);
      isDirty = false;

      event.preventDefault();
      return;
    }

    // 2回目：抜ける
    window.flune.navigation.focusPage();
    event.preventDefault();
  });
}
