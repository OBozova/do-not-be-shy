import { randomUUID } from "node:crypto";
import type { Conversation } from "shared";
import { Scenario } from "../domain/scenario.js";
import { UserMessage } from "../domain/userMessage.js";
import type { ConversationCoachService } from "../domain/services/conversationCoachService.js";
import type { ConversationRepository } from "../domain/ports/conversationRepository.js";
import { ConversationNotFoundError } from "../domain/errors.js";

/**
 * Application-layer use case for a follow-up message within an existing
 * conversation: loads the conversation, runs the domain service against its
 * scenario/suggestions/prior messages, appends the user+assistant exchange,
 * and persists the result.
 */
export class ContinueConversationUseCase {
  constructor(
    private readonly coach: ConversationCoachService,
    private readonly conversations: ConversationRepository,
  ) {}

  async execute(conversationId: string, rawMessage: string): Promise<Conversation> {
    const conversation = await this.conversations.findById(conversationId);
    if (!conversation) {
      throw new ConversationNotFoundError(conversationId);
    }

    const message = UserMessage.fromText(rawMessage);
    const scenario = Scenario.fromDescription(conversation.scenario.description);

    const reply = await this.coach.continue(
      scenario,
      conversation.suggestions,
      conversation.messages,
      message,
    );

    const updated: Conversation = {
      ...conversation,
      messages: [
        ...conversation.messages,
        { id: randomUUID(), role: "user", content: message.text, createdAt: new Date().toISOString() },
        { id: randomUUID(), role: "assistant", content: reply, createdAt: new Date().toISOString() },
      ],
    };

    await this.conversations.update(updated);
    return updated;
  }
}
