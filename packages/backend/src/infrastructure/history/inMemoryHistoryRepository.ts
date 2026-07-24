import type { HistoryEntry } from "shared";
import type { HistoryRepository } from "../../domain/ports/historyRepository.js";

/**
 * Process-lifetime history storage — no database, cleared on restart.
 * Swappable for a persisted repository later without touching use cases,
 * since both would implement the same HistoryRepository port.
 */
export class InMemoryHistoryRepository implements HistoryRepository {
  private readonly entries: HistoryEntry[] = [];

  async add(entry: HistoryEntry): Promise<void> {
    this.entries.unshift(entry);
  }

  async list(): Promise<HistoryEntry[]> {
    return [...this.entries];
  }
}
