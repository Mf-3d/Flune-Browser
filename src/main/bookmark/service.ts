import { DataManager } from "../lib/data";
import { BookmarkInput } from "../lib/data";

export class BookmarkService {
  constructor (private readonly data: DataManager) { }
  toggle(input: BookmarkInput): boolean {
    const bookmark = this.data.bookmarks.getByUrl(input.url);
    if (bookmark) {
      this.data.bookmarks.remove(bookmark.id);
      return false;
    } else {
      this.data.bookmarks.add(input);
      return true;
    }
  }

  isBookmarked(url: string): boolean {
    return this.data.bookmarks.existByUrl(url);
  }
}