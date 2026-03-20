export type Bookmark = {
  type: "bookmark";
  id: string;
  title: string;
  url: string;
  tag: string[];
  /**
   * Specify the ID of "root" or parent folder.
   */
  parentId: string; // フォルダ
};
export type BookmarkFolder = {
  type: "folder";
  id: string;
  title: string;
  tag: string[];
  parentId: string;
};
export type History = {
  title: string;
  url: string;
  date: string;
};
export type Download = {
  id: string;
  state: "progressing" | "interrupted" | "interrupted-done" | "completed" | "cancelled";
  url: string;
  filePath: string;
  date: Date;
  totalSize: number | null;
  receivedSize: number | null;
  percentComplete: number | null;
};

export type FolderId = `${string}-${string}-${string}-${string}` | "root";

export type BookmarkInput = {
  url: string;
  title: string;
  tag?: string[];
  /**
   * Specify the ID of "root" or parent folder.
   */
  parentId?: FolderId;
};

export type Data = {
  /**
   * Config version.
   * @example [3,0,0]
   */
  version: [number, number, number];
  history: History[];
  bookmark: Bookmark[];
};