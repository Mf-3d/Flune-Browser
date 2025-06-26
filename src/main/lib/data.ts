import path from "node:path";
import fs from "node:fs";
import Store from "electron-store";

const DEFAULT_CONFIG_PATH = path.join(__dirname, "..", "assets", "store", "default", "data-3.json");

type Bookmark = {
  type: "bookmark";
  id: string;
  title: string;
  url: string;
  tag: string[];
  parentId: string; // フォルダ
};
type BookmarkFolder = {
  type: "folder";
  id: string;
  title: string;
  tag: string[];
  parentId: string;
};

type ConfigType = {
  version: [number, number, number];
  history: any[]; // 未実装
  bookmarks: Bookmark[];
  bookmarkFolders: BookmarkFolder[];
  downloads: any[]; // 未実装
};

export class DataManager {
  readonly config;

  constructor() {
    const DEFAULT_CONFIG = JSON.parse(fs.readFileSync(DEFAULT_CONFIG_PATH, {
      encoding: "utf-8"
    }));

    this.config = new Store<ConfigType>({
      name: "data-3",
      defaults: DEFAULT_CONFIG,
    });
  }

  bookmarks = {
    folders: {
      getStuff: (folderId: string): (Bookmark | BookmarkFolder)[] => {
        let bookmarks = this.bookmarks.getAll().filter(bookmark => bookmark.parentId === folderId);
        let folders = this.bookmarks.folders.getAll().filter(folder => folder.parentId === folderId);
  
        return [...bookmarks, ...folders];
      },
      getAll: () => {
        return this.config.get("bookmarkFolders");
      },
      getById: (folderId: string) => {
        return this.bookmarks.folders.getAll().find(folder => folder.id === folderId);
      },
      exist: (folderId: string): boolean => {
        return this.bookmarks.folders.getById(folderId) !== undefined;
      },
      create: (folder: {
        title: string;
        tag: string[];
        parentId: string;
      }) => {
        if (!this.bookmarks.folders.exist(folder.parentId)) {
          console.error("Could not create folder: The folder does not exist.");
          return;
        }
  
        this.config.set("bookmarkFolders", this.bookmarks.folders.getAll().push({
          type: "folder",
          id: crypto.randomUUID(),
          title: folder.title,
          tag: folder.tag,
          parentId: folder.parentId,
        }));
      },
    },
    getAll: () => {
      return this.config.get("bookmarks");
    },
    getById: (id: string) => {
      return this.bookmarks.getAll().find(bookmark => bookmark.id === id);
    },
    
    getByUrl: (url: string) => {
      return this.bookmarks.getAll().find(bookmark => bookmark.url === url);
    },
    getByTag: (tag: string): Bookmark[] => {
      return this.bookmarks.getAll().filter(bookmark => bookmark.tag.includes(tag));
    },
    add: (bookmark: {
      title: string;
      url: string;
      tag: string[];
      parentId: string;
    }) => {
      if (!this.bookmarks.folders.exist(bookmark.parentId)) {
        console.error("Could not add bookmark: The folder does not exist.");
        return;
      }

      this.config.set("bookmarks", this.bookmarks.getAll().push({
        type: "bookmark",
        id: crypto.randomUUID(),
        title: bookmark.title,
        url: bookmark.url,
        tag: bookmark.tag,
        parentId: bookmark.parentId,
      }));
    }
  };
}

const data = new DataManager;