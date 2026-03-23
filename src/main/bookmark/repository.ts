import type { DataStore } from "@/main/infrastructure/storage/data-store";
import type { Bookmark, BookmarkNode } from "@/shared/types/bookmark";

export class BookmarkRepository {
  constructor(private readonly store: DataStore) {}

  getAll(): BookmarkNode[] {
    return this.store.get("bookmark");
  }

  getById(id: string): BookmarkNode | undefined {
    return this.getAll().find((bookmark) => bookmark.id === id);
  }

  getByUrl(url: string): Bookmark | undefined {
    return this.getAll().find(
      (bookmark) => bookmark.type === "bookmark" && bookmark.url === url
    ) as Bookmark;
  }

  save(bookmark: BookmarkNode): BookmarkNode {
    const bookmarks = this.getAll();
    bookmarks.push(bookmark);
    this.store.set("bookmark", bookmarks);

    return bookmark;
  }

  delete(id: string): void {
    const bookmarks = this.getAll().filter((bookmark) => bookmark.id !== id);
    this.store.set("bookmark", bookmarks);
  }
}
