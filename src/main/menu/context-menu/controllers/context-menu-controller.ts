import { app, Menu, ContextMenuParams, clipboard } from "electron";
import { createEmojiMenuTemplate } from "@/main/menu/context-menu/templates/emoji";
import { Window } from "@/main/window/window";
import { createTextSelectionMenuTemplate } from "@/main/menu/context-menu/templates/text-selection";
import { createVideoSelectionMenuTemplate } from "@/main/menu/context-menu/templates/video-selection";
import { createEditableSelectionMenuTemplate } from "@/main/menu/context-menu/templates/editable-selection";
import { createLinkSelectionMenuTemplate } from "@/main/menu/context-menu/templates/link-selection";
import { createNavigationMenuTemplate } from "@/main/menu/context-menu/templates/navigation";
import { createViewMenuTemplate } from "@/main/menu/context-menu/templates/view";
import { resolveView, ROUTE_MAP } from "@/shared/resolveView";

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
    private readonly window: Window,
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
      newTab: () => this.window.tabManager.createTab({
        isActive: true
      }),
      copyLinkURL: () => {
        clipboard.writeText(params.linkURL);
      },
      toggleNavigationDevTools: () => this.window.navigation.view.webContents.toggleDevTools(),
      toggleDevTools: () => this.window.tabManager.getActiveTab()?.toggleDevTools(),
      openSettings: () => this.window.tabManager.navigate(resolveView(ROUTE_MAP.settings)),
      searchSelectionText: () => this.window.tabManager.createTab({
        input: params.selectionText,
        isActive: true
      }),
      startPip: () =>
        this.window.tabManager.getActiveTab()?.webContents.executeJavaScript(
          `(document.activeElement.tagName === "video") ? document.activeElement.requestPictureInPicture() : document.activeElement.querySelector("video").requestPictureInPicture();`
        ),
      goBack: () => this.window.tabManager.getActiveTab()?.goBack(),
      goForward: () => this.window.tabManager.getActiveTab()?.goForward(),
      reloadTab: () => this.window.tabManager.getActiveTab()?.reload(),
      viewSource: () => this.window.tabManager?.createTab({
        input: `view-source:${this.window.tabManager.getActiveTab()?.url}`,
        isActive: true,
      }),
    };
  }
}