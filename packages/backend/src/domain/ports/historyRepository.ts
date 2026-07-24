import type { HistoryEntry } from "shared";

export interface HistoryRepository {
  add(entry: HistoryEntry): Promise<void>;
  list(): Promise<HistoryEntry[]>;
}
