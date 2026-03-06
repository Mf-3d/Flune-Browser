import lucide from "../../script/icons.js";
import { HomeActions } from "./actions/home-actions.js";

window.addEventListener("DOMContentLoaded", onInit);

function onInit() {
  const searchButton = document.getElementById("search-button");
  searchButton?.addEventListener("click", () => HomeActions.search());

  lucide.createIcons();
}