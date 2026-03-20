import type { DataStore } from "@/main/infrastructure/storage/data-store";
import type { Bookmark } from "@/shared/types/data";


export class BookmarkRepository {
  constructor(private readonly store: DataStore) { }

  getAll(): Bookmark[] {
    return this.store.get("bookmark");
  }

  getById(id: string): Bookmark | undefined {
    return this.getAll().find(bookmark => bookmark.id === id);
  }

  getByUrl(url: string): Bookmark | undefined {
    return this.getAll().find(bookmark => bookmark.url === url);
  }

  save(bookmark: Bookmark): Bookmark {
    const bookmarks = this.getAll();
    bookmarks.push(bookmark);
    this.store.set("bookmark", bookmarks);

    return bookmark;
  }

  delete(id: string): void {
    const bookmarks = this.getAll().filter(bookmark => bookmark.id !== id);
    this.store.set("bookmark", bookmarks);
  }
}