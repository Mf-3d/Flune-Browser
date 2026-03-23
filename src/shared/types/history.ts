export type HistoryItem = {
  id: string;
  title: string;
  url: string;
  date: string;
};
export type GroupedHistory = {
  date: Date;
  items: HistoryItem[];
};
