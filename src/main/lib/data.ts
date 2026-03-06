import path from "node:path";
import fs from "node:fs";
import Store from "electron-store";
import { Bookmark, BookmarkFolder, History, Download, FolderId, BookmarkInput } from "@/shared/types/data";

const DEFAULT_CONFIG_PATH = path.join(__dirname, "..", "..", "assets", "store", "default", "data-3.json");

type ConfigType = {
  version: [number, number, number];
  history: History[]; // 未実装
  bookmarks: Bookmark[];
  bookmarkFolders: BookmarkFolder[];
  downloads: any[]; // 未実装
};

/**
 * @deprecated
 */
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
      getStuff: (folderId: FolderId): (Bookmark | BookmarkFolder)[] => {
        let bookmarks = this.bookmarks.getAll().filter(bookmark => bookmark.parentId === folderId);
        let folders = this.bookmarks.folders.getAll().filter(folder => folder.parentId === folderId);

        return [...bookmarks, ...folders];
      },
      getAll: () => {
        return this.config.get("bookmarkFolders");
      },
      getById: (folderId: FolderId) => {
        return this.bookmarks.folders.getAll().find(folder => folder.id === folderId);
      },
      exist: (folderId: FolderId): boolean => {
        if (folderId === "root") return true;
        return this.bookmarks.folders.getById(folderId) !== undefined;
      },
      create: (folder: {
        title: string;
        tag: string[];
        parentId: FolderId;
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
     * @param input Bookmark data to add.
     * @returns New bookmark
     */
    add: (input: BookmarkInput): Bookmark | null => {
      if (!input.parentId) input.parentId = "root";

      if (!this.bookmarks.folders.exist(input.parentId)) {
        console.error("Could not add bookmark: The folder does not exist.");
        return null;
      }

      const bookmarks = this.bookmarks.getAll();
      let newBookmark: Bookmark = {
        type: "bookmark",
        id: crypto.randomUUID(),
        title: input.title,
        url: input.url,
        tag: input.tag ?? [],
        parentId: input.parentId,
      };
      bookmarks.push(newBookmark);

      this.config.set("bookmarks", bookmarks);

      return newBookmark;
    },
    remove: (id: string) => {
      this.config.set("bookmarks", this.bookmarks.getAll().filter(bookmark => bookmark.id !== id));
    }
  };

  histories = {
    getAll: () => {
      return this.config.get("history");
    },
    getByUrl: (url: string) => {
      return this.histories.getAll().find(history => history.url === url);
    },
    getByDate: (date: Date) => {
      return this.histories.getAll().find(history => history.date === date);
    },
    getByDuration: (duration: [Date, Date]): History[] => {
      return this.histories.getAll().filter(history =>
        duration[0].getTime() <= history.date.getTime() && history.date.getTime() <= duration[1].getTime()
      );
    },

    add: (data: History) => {
      const histories = this.histories.getAll();
      let latestHistory = histories.at(-1);
      if (latestHistory && latestHistory.url === data.url) return;

      histories.push(data);

      this.config.set("history", histories);

      return data;
    }
  };

  downloads = {
    getAll: () => {
      return this.config.get("downloads");
    },
    getById: (id: string): Download => {
      return this.downloads.getAll().find(download => download.id === id);
    },
    getByDate: (date: Date): Download => {
      return this.downloads.getAll().find(download => download.date === date);
    },
    getByDuration: (duration: [Date, Date]): Download[] => {
      return this.downloads.getAll().filter(download =>
        duration[0].getTime() <= download.date.getTime() && download.date.getTime() <= duration[1].getTime()
      );
    },

    add: (data: {
      state: "progressing" | "interrupted" | "interrupted-done" | "completed" | "cancelled";
      url: string;
      filePath: string;
      date: Date;
      totalSize: number | null;
      receivedSize: number | null;
      percentComplete: number | null;
    }): Download => {

      let download: Download = {
        id: crypto.randomUUID(),
        ...data
      };
      const downloads = this.downloads.getAll();
      downloads.push(download);

      this.config.set("downloads", downloads);

      return download;
    },
    edit: (id: string, data: Download) => {
      let downloads = this.downloads.getAll();
      let ids: string[] = downloads.map((download) => download.id);
      downloads[ids.indexOf(id)] = data;

      this.config.set("downloads", downloads);
    }
  };
}
export * from "../../shared/types/data";