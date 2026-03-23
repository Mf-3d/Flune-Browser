import type { BookmarkFolderInput, BookmarkInput, FolderId } from "@/shared/types/data";
import type { BookmarkRepository } from "./repository";
import type { EventBus } from "@/main/infrastructure/event/event-bus";
import type {
  Bookmark,
  BookmarkFolder,
  BookmarkNode,
  BookmarkNodeWithChildren,
} from "@/shared/types/bookmark";

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
      createdAt: new Date().toISOString(),
      parentId: input.parentId ?? "root",
    };

    return this.repository.save(bookmark);
  }

  createFolder(input: BookmarkFolderInput) {
    const folder: BookmarkFolder = {
      type: "folder",
      id: crypto.randomUUID(),
      title: input.title,
      tag: input.tag ?? [],
      parentId: input.parentId ?? "root",
    };

    return this.repository.save(folder);
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
    const nodes = this.repository.getAll();

    return nodes.filter((bookmark) => bookmark.parentId === parentId);
  }

  buildTree(nodes: BookmarkNode[]) {
    const map = new Map<string, BookmarkNodeWithChildren>();
    const roots: BookmarkNodeWithChildren[] = [];

    for (const node of nodes) {
      switch (node.type) {
        case "bookmark":
          map.set(node.id, node);
          break;
        case "folder":
          map.set(node.id, { ...node, children: [] });
          break;
      }
    }

    for (const node of nodes) {
      const item = map.get(node.id)!;

      if (node.parentId === "root") {
        roots.push(item);
      } else {
        const parent = map.get(node.parentId);
        if (parent?.type === "folder") parent?.children.push(item);
      }
    }

    return roots;
  }

  getTree() {
    const nodes = this.repository.getAll();

    return this.buildTree(nodes);
  }
}
