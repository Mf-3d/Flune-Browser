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

export async function navigateTo(page: MenuPageId) {
  state.pageStack.push(page);

  await renderMenu(page);
  registerClickEvents();
}

export async function goBack() {
  state.pageStack.pop();
  
  await renderMenu(getCurrentPage()!);
  registerClickEvents();
}
