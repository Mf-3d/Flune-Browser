import type { NativeImage } from "electron";
import type { BookmarkNode } from "./bookmark";
import type { HistoryItem } from "./history";

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
export type BookmarkFolderInput = {
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
  bookmark: BookmarkNode[];
};

export type Favicon = {
  url: string; // faviconのURL（キー）
  data: NativeImage; // 画像データ
};
