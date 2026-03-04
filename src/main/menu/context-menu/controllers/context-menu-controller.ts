import { app, Menu, ContextMenuParams, clipboard } from "electron";
import { createEmojiMenuTemplate } from "@/main/menu/context-menu/templates/emoji";
import { Base } from "@/main/window/base-window";
import { createTextSelectionMenuTemplate } from "../templates/text-selection";
import { createVideoSelectionMenuTemplate } from "../templates/video-selection";
import { createEditableSelectionMenuTemplate } from "../templates/editable-selection";
import { createLinkSelectionMenuTemplate } from "../templates/link-selection";
import { createNavigationMenuTemplate } from "../templates/navigation/default";
import { createViewMenuTemplate } from "../templates/view";

export type ContextMenuActions = {
  showEmojiPanel: () => void,
  newTab: () => void,
  copyLinkURL: () => void,
  toggleNavigationDevTools: () => void,
  toggleDevTools: () => void,
  openSettings: () => void,
  searchSelectionText: () => void,
  startPip: () => void,
  goBack: () => void,
  goForward: () => void,
  reloadTab: () => void,
  viewSource: () => void,
};

type ContextSource =
  | {
    area: "view";
    state: {
      canGoBack: boolean;
      canGoForward: boolean;
    }
  }
  | {
    area: "navigation";
  };

export class ContextMenuController {
  constructor(
    private readonly baseWindow: Base,
  ) { }

  register(webContents: Electron.WebContents, source: ContextSource) {
    webContents.on("context-menu", (_, params) => {
      const actions = this.createActions(params);
      const template = this.resolveTemplate(params, actions, source);
      const menu = Menu.buildFromTemplate(template);
      menu.popup();
    });
  }

  private resolveTemplate(params: ContextMenuParams, actions: ContextMenuActions, source: ContextSource) {
    let sections: Electron.MenuItemConstructorOptions[][] = [];

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
    } else if (source.area === "view") {
      sections.push(createViewMenuTemplate(source.state, actions))
    }

    return this.joinSections(sections);
  }

  private joinSections(
    sections: Electron.MenuItemConstructorOptions[][]
  ): Electron.MenuItemConstructorOptions[] {
    return sections.flatMap((section, index) => {
      if (index === 0) return section;

      return [
        { type: "separator" },
        ...section
      ];
    });
  }

  private createActions(params: ContextMenuParams): ContextMenuActions {
    return {
      showEmojiPanel: () => app.showEmojiPanel(),
      newTab: () => this.baseWindow.tabManager.newTab(undefined, {
        active: true
      }),
      copyLinkURL: () => {
        clipboard.writeText(params.linkURL);
      },
      toggleNavigationDevTools: () => this.baseWindow.nav.webContents.toggleDevTools(),
      toggleDevTools: () => this.baseWindow.tabManager.toggleDevTools(),
      openSettings: () => this.baseWindow.tabManager.settings.openSettingsAsTab(),
      searchSelectionText: () => this.baseWindow.tabManager?.newTab(params.selectionText, {
        active: true
      }),
      startPip: () =>
        this.baseWindow.tabManager.getActiveTabCurrent()?.entity.webContents.executeJavaScript(
          `(document.activeElement.tagName === "video") ? document.activeElement.requestPictureInPicture() : document.activeElement.querySelector("video").requestPictureInPicture();`
        ),
      goBack: () => this.baseWindow.tabManager.goBack(),
      goForward: () => this.baseWindow.tabManager.goForward(),
      reloadTab: () => this.baseWindow.tabManager.reloadTab(),
      viewSource: () => this.baseWindow.tabManager?.newTab(
        `view-source:${this.baseWindow.tabManager.getActiveTabCurrent()?.entity.webContents.getURL()}`
      ),
    };
  }
}