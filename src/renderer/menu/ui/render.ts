import type { OptionMenuItem } from "@/shared/types/menu";

export function renderMenu(items: OptionMenuItem[]) {
  return items.map((item) => {
    switch (item.type) {
      case "item":
        return `
        <a
          href="#"
          role="menuitem"
          data-action="${item.action.type}"
          data-payload="${JSON.stringify(item.action.payload ?? {})}"
          aria-disabled="${!item.enabled}"
          title="${item.label}"
          class="menu-item ${item.enabled ? "" : "disabled"}"
        >
          <span class="title">${item.label}</span>
          ${item.accelerator ?
            `
          <span class="accel">
            ${item.accelerator?.split("+").map((acc) => `<kbd>${acc}</kbd>`).join("+")}
          </span>
          `
            :
            ""
          }
        }
        </a>
        `;
      case "submenu":
        return `
        <a
          href="#"
          role="menuitem"
          data-action="submenu"
          title="${item.label}"
          class="menu-item"
        >
        <i data-lucide=\"chevron-right\"></i>
        }
        </a>
        `;
      case "separator":
        return "<hr />";
    }
  }).join("");
}