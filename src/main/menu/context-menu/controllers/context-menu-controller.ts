import { Menu, ContextMenuParams } from "electron";
import { createEmojiMenuTemplate } from "@/main/menu/context-menu/templates/emoji";
import { createTextSelectionMenuTemplate } from "@/main/menu/context-menu/templates/text-selection";
import { createVideoSelectionMenuTemplate } from "@/main/menu/context-menu/templates/video-selection";
import { createEditableSelectionMenuTemplate } from "@/main/menu/context-menu/templates/editable-selection";
import { createLinkSelectionMenuTemplate } from "@/main/menu/context-menu/templates/link-selection";
import { createNavigationMenuTemplate } from "@/main/menu/context-menu/templates/navigation";
import { createTabMenuTemplate } from "@/main/menu/context-menu/templates/tab";

import type { Window } from "@/main/window/window";
import type { Tab } from "@/main/tab/tab";
import type { ContextMenuActions } from "../types/actions";
import { createActions } from "../actions/context-menu-actions";

type ContextSource =
  | {
      area: "tab";
      tab: Tab;
    }
  | {
      area: "navigation";
    };

export class ContextMenuController {
  constructor(private readonly window: Window) {}

  register(webContents: Electron.WebContents, source: ContextSource) {
    webContents.on("context-menu", (_, params) => {
      const actions = createActions({ window: this.window }, params);
      const template = this.resolveTemplate(params, actions, source);
      const menu = Menu.buildFromTemplate(template);
      menu.popup();
    });
  }

  private resolveTemplate(
    params: ContextMenuParams,
    actions: ContextMenuActions,
    source: ContextSource
  ) {
    const sections: Electron.MenuItemConstructorOptions[][] = [];

    if (params.isEditable && process.platform !== "linux") {
      sections.push(createEmojiMenuTemplate(actions));
    }

    if (params.mediaType === "video") {
      sections.push(createVideoSelectionMenuTemplate(actions));
    }

    if (params.isEditable) {
      sections.push(createEditableSelectionMenuTemplate(params.selectionText));
    } else {
      if (params.selectionText) {
        sections.push(createTextSelectionMenuTemplate(params.selectionText, actions));
      }

      if (params.linkURL ?? params.linkText) {
        sections.push(createLinkSelectionMenuTemplate(actions));
      }
    }

    if (source.area === "navigation") {
      sections.push(createNavigationMenuTemplate(actions));
    } else if (source.area === "tab") {
      sections.push(createTabMenuTemplate(source.tab, actions));
    }

    return this.joinSections(sections);
  }

  private joinSections(
    sections: Electron.MenuItemConstructorOptions[][]
  ): Electron.MenuItemConstructorOptions[] {
    return sections.flatMap((section, index) => {
      if (index === 0) return section;

      return [{ type: "separator" }, ...section];
    });
  }
}
