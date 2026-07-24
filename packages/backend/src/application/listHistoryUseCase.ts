import type { HistoryEntry } from "shared";
import type { HistoryRepository } from "../domain/ports/historyRepository.js";

export class ListHistoryUseCase {
  constructor(private readonly history: HistoryRepository) {}

  async execute(): Promise<HistoryEntry[]> {
    return this.history.list();
  }
}
