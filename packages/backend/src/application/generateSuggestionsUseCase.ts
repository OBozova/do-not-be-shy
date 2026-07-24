import { randomUUID } from "node:crypto";
import type { Conversation, ScenarioInput } from "shared";
import { Scenario } from "../domain/scenario.js";
import type { ConversationCoachService } from "../domain/services/conversationCoachService.js";
import type { ConversationRepository } from "../domain/ports/conversationRepository.js";

/**
 * Application-layer use case: translates a raw request DTO into domain
 * objects, runs the domain service, then records the result. HTTP routes
 * call this and nothing lower — they never touch the domain directly.
 */
export class GenerateSuggestionsUseCase {
  constructor(
    private readonly coach: ConversationCoachService,
    private readonly conversations: ConversationRepository,
  ) {}

  async execute(input: ScenarioInput): Promise<Conversation> {
    const scenario = Scenario.fromDescription(input.description);
    const suggestions = await this.coach.coach(scenario);

    const conversation: Conversation = {
      id: randomUUID(),
      scenario: { description: scenario.description },
      suggestions,
      messages: [],
      createdAt: new Date().toISOString(),
    };

    await this.conversations.add(conversation);
    return conversation;
  }
}
