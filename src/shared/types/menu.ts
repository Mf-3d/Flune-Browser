export type PayloadOf<T extends MenuActionDescriptor["type"]> =
  Extract<MenuActionDescriptor, { type: T }> extends { payload?: infer P }
    ? P | undefined
    : undefined;

export type ActionHandlerMap = {
  [K in MenuActionDescriptor["type"]]: (
    payload: PayloadOf<K>
  ) => void
};

export type MenuActionDescriptorType = MenuActionDescriptor["type"];
export type MenuActionDescriptor =
  | {
    type: "quit";
    payload: undefined;
  }
  | {
    type: "new-tab";
    payload: undefined;
  }
  | {
    type: "add-bookmark";
    payload: undefined;
  }
  | {
    type: "open-bookmarks-page";
    payload: undefined;
  }
  | {
    type: "open-histories-page";
    payload: undefined;
  }
  | {
    type: "open-downloads-page";
    payload: undefined;
  }
  | {
    type: "open-versions-page";
    payload: undefined;
  }
  | {
    type: "open-settings-page";
    payload: undefined;
  }
  | {
    type: "open-bookmark";
    payload: { id: string }
  }
  | {
    type: "open-history";
    payload: { id: string }
  };

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