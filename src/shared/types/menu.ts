type MenuId =
  | "new-tab"
  | "add-bookmark"
  | "open-bookmark"
  | "open-bookmarks"
  | "open-downloads"
  | "open-versions"
  | "open-settings"
  | "quit";

export type MenuActionDescriptor =
  | { type: "quit" }
  | { type: "new-tab" }
  | { type: "add-bookmark" }
  | { type: "open-bookmarks-page" }
  | { type: "open-downloads-page" }
  | { type: "open-versions-page" }
  | { type: "open-settings-page" }
  | { type: "open-bookmark"; id: string }
  | { type: "open-history"; id: string };

export type Submenu =
  | "bookmarks"
  | "histories";

export type OptionMenuItem = 
  | MenuActionItem 
  | SubmenuItem
  | MenuSeparatorItem;

type MenuActionItem = {
  type: "item";
  label: string;
  accelerator?: string;
  action: MenuActionDescriptor;
  enabled?: boolean;
  checked?: boolean;
};

type SubmenuItem = {
  type: "submenu";
  label: string;
  children: OptionMenuItem[];
};

type MenuSeparatorItem = {
  type: "separator";
};