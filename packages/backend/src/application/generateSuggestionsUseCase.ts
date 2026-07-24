import { randomUUID } from "node:crypto";
import type { HistoryEntry, ScenarioInput } from "shared";
import { Scenario } from "../domain/scenario.js";
import type { ConversationCoachService } from "../domain/services/conversationCoachService.js";
import type { HistoryRepository } from "../domain/ports/historyRepository.js";

/**
 * Application-layer use case: translates a raw request DTO into domain
 * objects, runs the domain service, then records the result. HTTP routes
 * call this and nothing lower — they never touch the domain directly.
 */
export class GenerateSuggestionsUseCase {
  constructor(
    private readonly coach: ConversationCoachService,
    private readonly history: HistoryRepository,
  ) {}

  async execute(input: ScenarioInput): Promise<HistoryEntry> {
    const scenario = Scenario.fromDescription(input.description);
    const suggestions = await this.coach.coach(scenario);

    const entry: HistoryEntry = {
      id: randomUUID(),
      scenario: { description: scenario.description },
      suggestions,
      createdAt: new Date().toISOString(),
    };

    await this.history.add(entry);
    return entry;
  }
}
