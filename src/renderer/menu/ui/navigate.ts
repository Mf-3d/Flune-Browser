import { MenuPageId } from "../../../shared/types/menu";
import { MenuState } from "../types";
import { registerClickEvents } from "./click-events";
import { renderMenu } from "./render";

const state: MenuState = {
  pageStack: ["root"],
};

export function getCurrentPage(): MenuPageId | undefined {
  return state.pageStack.at(-1);
}

export function navigateTo(page: MenuPageId) {
  state.pageStack.push(page);

  renderMenu(page);
  registerClickEvents();
}

export function goBack() {
  state.pageStack.pop();
  
  renderMenu(getCurrentPage()!);
  registerClickEvents();
}
