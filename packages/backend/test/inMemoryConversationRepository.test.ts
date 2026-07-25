import { describe, expect, it } from "vitest";
import type { Conversation } from "shared";
import { InMemoryConversationRepository } from "../src/infrastructure/conversation/inMemoryConversationRepository.js";

// NOTE: this is in-memory storage, cleared on restart — it should not be used in production.
// This should change to a persisted repository before shipping(some kind of NoSQL database is making sense but it is debatable).

function conversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: "conversation-1",
    scenario: { description: "Coffee chat with a new colleague" },
    suggestions: {
      openers: [],
      jokes: [],
      talkingPoints: [],
      researchTopics: [],
    },
    messages: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("InMemoryConversationRepository", () => {
  it("adds and lists conversations", async () => {
    const repository = new InMemoryConversationRepository();
    const saved = conversation();

    await repository.add(saved);

    expect(await repository.list()).toEqual([saved]);
  });

  it("finds a conversation by id, or returns undefined when missing", async () => {
    const repository = new InMemoryConversationRepository();
    const saved = conversation();
    await repository.add(saved);

    expect(await repository.findById(saved.id)).toEqual(saved);
    expect(await repository.findById("missing-id")).toBeUndefined();
  });

  it("updates an existing conversation in place", async () => {
    const repository = new InMemoryConversationRepository();
    const saved = conversation();
    await repository.add(saved);

    const updated = {
      ...saved,
      messages: [
        { id: "1", role: "user" as const, content: "Hi", createdAt: "" },
      ],
    };
    await repository.update(updated);

    expect(await repository.findById(saved.id)).toEqual(updated);
  });
});
