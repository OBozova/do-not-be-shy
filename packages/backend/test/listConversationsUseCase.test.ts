import { describe, expect, it } from "vitest";
import type { Conversation } from "shared";
import { ListConversationsUseCase } from "../src/application/listConversationsUseCase.js";
import type { ConversationRepository } from "../src/domain/ports/conversationRepository.js";

class FakeConversationRepository implements ConversationRepository {
  constructor(private readonly conversations: Conversation[]) {}

  async add(): Promise<void> {}
  async update(): Promise<void> {}

  async list(): Promise<Conversation[]> {
    return this.conversations;
  }

  async findById(): Promise<Conversation | undefined> {
    return undefined;
  }
}

describe("ListConversationsUseCase", () => {
  it("returns the conversations from the repository", async () => {
    const conversations: Conversation[] = [
      {
        id: "conversation-1",
        scenario: { description: "Coffee chat with a new colleague" },
        suggestions: { openers: [], jokes: [], talkingPoints: [], researchTopics: [] },
        messages: [],
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ];
    const useCase = new ListConversationsUseCase(new FakeConversationRepository(conversations));

    await expect(useCase.execute()).resolves.toEqual(conversations);
  });

  it("returns an empty list when the repository has no conversations", async () => {
    const useCase = new ListConversationsUseCase(new FakeConversationRepository([]));

    await expect(useCase.execute()).resolves.toEqual([]);
  });
});
