import lucide from "../../utils/icons";
import { HomeActions } from "./actions/home-actions";

window.addEventListener("DOMContentLoaded", onInit);

function onInit() {
  const searchButton = document.getElementById("search-button");
  searchButton?.addEventListener("click", () => HomeActions.search());

  lucide.createIcons();
}
