export type HistoryItem = {
  id: string;
  title: string;
  url: string;
  createdAt: string;
};
export type GroupedHistory = {
  date: Date;
  items: HistoryItem[];
};
