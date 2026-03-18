import { OptionMenuItem } from "../../shared/types/menu";

function renderMenu(items: OptionMenuItem[]) {
  return items.map((item) => {
    switch (item.type) {
      case "item":
        return `
        <a
          href="#"
          role="menuitem"
          data-id="${item.id}"
          aria-disabled="${Boolean(item.disabled)}"
          title="${item.label}"
          class="menu-item ${item.disabled ? "disabled" : ""}"
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