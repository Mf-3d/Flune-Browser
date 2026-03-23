import type { HistoryInput } from "@/shared/types/data";
import type { HistoryRepository } from "./repository";
import type { GroupedHistory, HistoryItem } from "@/shared/types/history";

export class HistoryService {
  constructor(private readonly repository: HistoryRepository) {}

  add(input: HistoryInput) {
    if (this.getLatest()?.url !== input.url) {
      const item: HistoryItem = {
        id: crypto.randomUUID(),
        title: input.title,
        url: input.url,
        date: new Date().toISOString(),
      };

      this.repository.save(item);
    }
  }

  updateTitle(url: string, title: string) {
    const item = this.getByUrl(url);

    if (!item) {
      throw new Error(`Latest history item does not exist.`);
    }

    item.title = title;
    this.repository.update(item);
  }

  getAll(): HistoryItem[] {
    return this.repository.getAll();
  }

  getByUrl(url: string): HistoryItem | undefined {
    return this.repository.getByUrl(url);
  }

  getById(id: string): HistoryItem | undefined {
    return this.repository.getById(id);
  }

  getLatest(): HistoryItem | undefined {
    return this.repository.getRecent(1).at(-1);
  }

  getRecent(limit: number): HistoryItem[] {
    return this.repository.getRecent(limit);
  }

  groupByDate(items: HistoryItem[]): GroupedHistory[] {
    const map = new Map<string, HistoryItem[]>();

    for (const item of items) {
      const date = new Date(item.date);
      const key = date.toDateString();

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key)!.push(item);
    }

    return Array.from(map.entries()).map(([key, items]) => ({
      date: new Date(key),
      items,
    }));
  }

  clearAll() {
    this.repository.clearAll();
  }

  clearOlderThan(days: number) {
    const milliseconds = days / (1000 * 60 * 60 * 24);

    const from = new Date();
    const to = new Date();

    from.setTime(from.getTime() - milliseconds);

    const period: [Date, Date] = [from, to];

    this.repository.clearByPeriod(period);
  }
}
