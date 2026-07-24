import type { Conversation } from "shared";
import type { ConversationRepository } from "../../domain/ports/conversationRepository.js";

/**
 * Process-lifetime conversation storage — no database, cleared on restart.
 * Swappable for a persisted repository later without touching use cases,
 * since both would implement the same ConversationRepository port.
 */
export class InMemoryConversationRepository implements ConversationRepository {
  private readonly conversations: Conversation[] = [];

  async add(conversation: Conversation): Promise<void> {
    this.conversations.unshift(conversation);
  }

  async list(): Promise<Conversation[]> {
    return [...this.conversations];
  }

  async findById(id: string): Promise<Conversation | undefined> {
    return this.conversations.find((conversation) => conversation.id === id);
  }

  async update(conversation: Conversation): Promise<void> {
    const index = this.conversations.findIndex((c) => c.id === conversation.id);
    if (index !== -1) {
      this.conversations[index] = conversation;
    }
  }
}
