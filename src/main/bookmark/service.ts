import type { BookmarkInput, FolderId } from "@/shared/types/data";
import type { BookmarkRepository } from "./repository";
import type { EventBus } from "@/main/infrastructure/event/event-bus";
import type { Bookmark, BookmarkNode } from "@/shared/types/bookmark";

export class BookmarkService {
  constructor(
    private readonly repository: BookmarkRepository,
    private readonly eventBus: EventBus
  ) {}

  add(input: BookmarkInput) {
    const bookmark: BookmarkNode = {
      type: "bookmark",
      id: crypto.randomUUID(),
      title: input.title,
      url: input.url,
      tag: input.tag ?? [],
      parentId: input.parentId ?? "root",
    };

    return this.repository.save(bookmark);
  }

  toggle(input: BookmarkInput) {
    if (this.isBookmarked(input.url)) {
      const bookmark = this.repository.getByUrl(input.url);

      if (bookmark) this.repository.delete(bookmark.id);
    } else {
      const bookmark = this.add(input);

      this.eventBus.send("bookmark:created", {
        bookmark,
      });
    }
  }

  isBookmarked(url: string): boolean {
    return Boolean(this.repository.getByUrl(url));
  }

  getAll(): BookmarkNode[] {
    return this.repository.getAll();
  }

  getBookmarkById(id: string): Bookmark | undefined {
    const bookmark = this.repository.getById(id);

    if (bookmark && bookmark.type === "bookmark") return bookmark;
    else return undefined;
  }

  getByUrl(url: string): Bookmark | undefined {
    return this.repository.getByUrl(url);
  }

  getChildren(parentId: FolderId): BookmarkNode[] {
    const bookmarks = this.repository.getAll();

    return bookmarks.filter((bookmark) => bookmark.parentId === parentId);
  }
}
