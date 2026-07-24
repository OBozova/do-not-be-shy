import type { Conversation } from "shared";

export interface ConversationRepository {
  add(conversation: Conversation): Promise<void>;
  list(): Promise<Conversation[]>;
  findById(id: string): Promise<Conversation | undefined>;
  update(conversation: Conversation): Promise<void>;
}
