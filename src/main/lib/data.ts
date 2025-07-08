import path from "node:path";
import fs from "node:fs";
import Store from "electron-store";

const DEFAULT_CONFIG_PATH = path.join(__dirname, "..", "..", "assets", "store", "default", "data-3.json");

type Bookmark = {
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

  /**
   * Bookmarks
   */
  bookmarks = {
    /**
     * Bookmark folders
     */
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
        if (folderId === "root") return true;
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

        const bookmarks = this.bookmarks.folders.getAll();
        bookmarks.push({
          type: "folder",
          id: crypto.randomUUID(),
          title: folder.title,
          tag: folder.tag,
          parentId: folder.parentId,
        });
  
        this.config.set("bookmarkFolders", bookmarks);
      },
    },
    /**
     * Get all registered bookmarks.
     * @returns All registered Bookmarks.
     */
    getAll: () => {
      return this.config.get("bookmarks");
    },
    /**
     * Get a bookmark by ID.
     * @returns Bookmark.
     */
    getById: (id: string) => {
      return this.bookmarks.getAll().find(bookmark => bookmark.id === id);
    },
    /**
     * Get a bookmark by URL.
     * @returns Bookmark.
     */
    getByUrl: (url: string) => {
      return this.bookmarks.getAll().find(bookmark => bookmark.url === url);
    },
    /**
     * Get a bookmark by tag.
     * @returns Bookmark.
     */
    getByTag: (tag: string): Bookmark[] => {
      return this.bookmarks.getAll().filter(bookmark => bookmark.tag.includes(tag));
    },
    /**
     * Check for the existence of a bookmark by ID.
     * @param id 
     * @returns 
     */
    existById: (id: string): boolean => {
      return this.bookmarks.getById(id) !== undefined;
    },
    /**
     * Check for the existence of a bookmark by URL.
     * @param url Bookmark URL
     * @returns
     */
    existByUrl: (url: string): boolean => {
      return this.bookmarks.getByUrl(url) !== undefined;
    },
    /**
     * Register a bookmark.
     * 
     * @param data Bookmark data to add.
     * @returns New bookmark
     */
    add: (data: {
      title: string;
      url: string;
      tag: string[];
      /**
       * Specify the ID of "root" or parent folder.
       */
      parentId: string;
    }): Bookmark | null => {
      if (!this.bookmarks.folders.exist(data.parentId)) {
        console.error("Could not add bookmark: The folder does not exist.");
        return null;
      }

      const bookmarks = this.bookmarks.getAll();
      let newBookmark: Bookmark = {
        type: "bookmark",
        id: crypto.randomUUID(),
        title: data.title,
        url: data.url,
        tag: data.tag,
        parentId: data.parentId,
      };
      bookmarks.push(newBookmark);

      this.config.set("bookmarks", bookmarks);

      return newBookmark;
    },
    remove: (id: string) => {
      this.config.set("bookmarks", this.bookmarks.getAll().filter(bookmark => bookmark.id !== id));
    }
  };
}