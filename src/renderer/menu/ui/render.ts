import { menuIpc } from "../ipc/menu-ipc";

import type { MenuPageId } from "../../../shared/types/menu";
import lucide from "../../utils/icons";

export async function renderMenu(pageId: MenuPageId) {
  const template = await menuIpc.getPage(pageId);

  if (!template) {
    return;
  }

  const result = template
    .map((item) => {
      switch (item.type) {
        case "item":
          return `
          <a
            href="#"
            role="menuitem"
            data-action="${item.action.type}"
            data-payload='${JSON.stringify(item.action.payload ?? {})}'
            aria-disabled="${item.enabled ?? true}"
            title="${item.label}"
            class="menu-item ${(item.enabled ?? true) ? "" : "disabled"}"
          >
            <span class="title">${item.label}</span>
            ${
              item.accelerator
                ? `
            <span class="accel">
              ${item.accelerator
                ?.split("+")
                .map((acc) => `<kbd>${acc}</kbd>`)
                .join("+")}
            </span>
            `
                : ""
            }
          </a>
          `;
        case "go-back":
          return `
          <a
            href="#"
            role="menuitem"
            data-action="go-back"
            title="${item.label}"
            class="menu-item"
          >
            <span class="title">${item.label}</span>
          </a>
          `;
        case "navigation":
          return `
          <a
            href="#"
            role="menuitem"
            data-action="navigate"
            data-target="${item.target}"
            title="${item.label}"
            class="menu-item"
          >
            <span class="title">${item.label}</span>
            <i data-lucide="chevron-right"></i>
          </a>
          `;
        case "separator":
          return "<hr />";
        case "header":
          return `
          <div class="header">
            <small>${item.label}</small>
          </div>
          `;
      }
    })
    .join("");

  const menuElement = document.querySelector("main>div")!;
  menuElement.innerHTML = result;

  lucide.createIcons();
}
