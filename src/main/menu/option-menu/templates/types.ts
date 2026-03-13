export type MenuId =
  | "new-tab"
  | "open-downloads"
  | "open-versions"
  | "open-settings"
  | "quit";

export type Submenu =
  | "bookmarks"
  | "histories";

export type MenuAction = () => void;

export type OptionMenuItem = {
  type: "item";
  id: MenuId;
  label: string;
  accelerator?: string;
} | {
  type: "submenu";
  id: Submenu;
  label: string;
} | {
  type: "separator";
};