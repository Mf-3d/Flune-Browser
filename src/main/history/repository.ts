import type { DataStore } from "@/main/infrastructure/storage/data-store";
import type { HistoryItem } from "@/shared/types/history";

export class HistoryRepository {
  constructor(private readonly store: DataStore) {}

  getAll(): HistoryItem[] {
    return this.store.get("history");
  }

  getRecent(limit: number) {
    const history = this.getAll();
    return history.slice(history.length - limit <= 0 ? 0 : history.length - limit);
  }

  /**
   * **Gets item by ID.**
   *
   * @param id ID for get.
   * @returns
   */
  getById(id: string): HistoryItem | undefined {
    return this.getAll().find((item) => item.id === id);
  }

  /**
   * **Gets item by URL.**
   *
   * If there are several,
   * it will returns latest the most recent one.
   *
   * @param url URL for get.
   * @returns
   */
  getByUrl(url: string): HistoryItem | undefined {
    // URLはIDと違ってユニークではないので最新のアイテムを取得する。
    return this.getAll()
      .filter((item) => item.url === url)
      .at(-1);
  }

  getByPeriod(period: [Date, Date]): HistoryItem[] {
    return this.getAll().filter(
      (history) =>
        period[0].getTime() <= new Date(history.createdAt).getTime() &&
        new Date(history.createdAt).getTime() <= period[1].getTime()
    );
  }

  save(item: HistoryItem): HistoryItem {
    const history = this.getAll();
    history.push(item);
    this.store.set("history", history);

    return item;
  }

  update(updated: HistoryItem): HistoryItem {
    const history = this.getAll();

    this.store.set(
      "history",
      history.map((item) => {
        if (item.id === updated.id && item.createdAt === updated.createdAt) {
          return updated;
        } else {
          return item;
        }
      })
    );

    return updated;
  }

  clearAll(): void {
    this.store.set("history", []);
  }

  clearByPeriod(period: [Date, Date]): void {
    const history = this.getAll();

    history.filter(
      (item) =>
        !(
          period[0].getTime() <= new Date(item.createdAt).getTime() &&
          new Date(item.createdAt).getTime() <= period[1].getTime()
        )
    );

    this.store.set("history", history);
  }
}
