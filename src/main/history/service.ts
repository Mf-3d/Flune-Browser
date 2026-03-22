import type { HistoryInput, HistoryItem } from "@/shared/types/data";
import type { HistoryRepository } from "./repository";

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

  getLatest(): HistoryItem | undefined {
    return this.repository.getAll().at(-1);
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
