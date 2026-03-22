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
export type HistoryItem = {
  id: string;
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
export type HistoryInput = {
  title: string;
  url: string;
};

export type Data = {
  /**
   * Config version.
   * @example [3,0,0]
   */
  version: [number, number, number];
  history: HistoryItem[];
  bookmark: Bookmark[];
};

export type Favicon = {
  url: string; // faviconのURL（キー）
  data: Buffer; // 画像データ
  updatedAt: number;
};

export type GroupedHistory = {
  date: Date;
  items: HistoryItem[];
};
