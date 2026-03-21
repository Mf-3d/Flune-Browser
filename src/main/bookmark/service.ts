import type { Bookmark, BookmarkInput } from "@/shared/types/data";
import type { BookmarkRepository } from "./repository";
import { EventBus } from "../infrastructure/event/event-bus";

export class BookmarkService {
  constructor(
    private readonly repository: BookmarkRepository,
    private readonly eventBus: EventBus
  ) {}

  add(input: BookmarkInput) {
    const bookmark: Bookmark = {
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

  getAll(): Bookmark[] {
    return this.repository.getAll();
  }

  getById(id: string): Bookmark | undefined {
    return this.repository.getById(id);
  }

  getByUrl(url: string): Bookmark | undefined {
    return this.repository.getByUrl(url);
  }
}
