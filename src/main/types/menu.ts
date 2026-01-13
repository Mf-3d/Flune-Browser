import { Bookmark, FolderId } from "./data";

export type MenuNode =
  | {
    type: "item";
    id: string;
    label: string;
    command: string;
    accelerator?: string;
  }
  | {
    type: "category";
    id: string;
    label: string;
    children: MenuNode[];
  }
  | {
    type: "bookmark-folder";
    id: FolderId;
    children: MenuNode[]; // BookmarkFolder.id と一致
    // label はIDから取得（ここでは定義しない）
  }
  | {
    type: "bookmark";
    id: string; // Bookmark.id と一致
    // label はIDから取得（ここでは定義しない）
  }
  | {
    type: "separator";
  };

/**
 * 表示・振る舞いの状態。
 */
export type MenuUIState = {
  expandedFolderIds: string[]; // 開かれているフォルダのID
  disabledItemIds: string[];
  selectedBookmarkId?: string;
  // 例えば：pinnedIds、recentIds
};

export type MenuState = {
  tree: MenuNode[];
  ui: MenuUIState;
  bookmarks: Bookmark[];
};