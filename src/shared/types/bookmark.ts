import { FolderId } from "./data";

export type Bookmark = {
  type: "bookmark";
  id: string;
  title: string;
  url: string;
  tag: string[];
  createdAt: string;
  /**
   * Specify the ID of "root" or parent folder.
   */
  parentId: FolderId; // フォルダ
};
export type BookmarkFolder = {
  type: "folder";
  id: string;
  title: string;
  tag: string[];
  parentId: FolderId;
};
export type BookmarkNode = Bookmark | BookmarkFolder;

export type BookmarkNodeWithChildren = Bookmark |
  (BookmarkFolder & {
    children: BookmarkNodeWithChildren[];
  });
