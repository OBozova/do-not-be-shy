import type { Conversation } from "shared";
import type { ConversationRepository } from "../domain/ports/conversationRepository.js";

export class ListConversationsUseCase {
  constructor(private readonly conversations: ConversationRepository) {}

  async execute(): Promise<Conversation[]> {
    return this.conversations.list();
  }
}
