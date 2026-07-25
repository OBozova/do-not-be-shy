import { describe, expect, it } from "vitest";
import {
  SUGGESTION_CATEGORIES,
  type Conversation,
  type SuggestionSet,
} from "shared";
import { ContinueConversationUseCase } from "../src/application/continueConversationUseCase.js";
import { ConversationNotFoundError } from "../src/domain/errors.js";
import { InvalidUserMessageError } from "../src/domain/userMessage.js";
import type { ConversationCoachService } from "../src/domain/services/conversationCoachService.js";
import type { ConversationRepository } from "../src/domain/ports/conversationRepository.js";

function fullSuggestionSet(): SuggestionSet {
  return Object.fromEntries(
    SUGGESTION_CATEGORIES.map((category) => [category, [`sample ${category}`]]),
  ) as SuggestionSet;
}

function existingConversation(
  overrides: Partial<Conversation> = {},
): Conversation {
  return {
    id: "conversation-1",
    scenario: { description: "Coffee chat with a new colleague" },
    suggestions: fullSuggestionSet(),
    messages: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

class FakeConversationRepository implements ConversationRepository {
  constructor(private readonly conversations: Conversation[] = []) {}

  readonly updated: Conversation[] = [];

  async add(conversation: Conversation): Promise<void> {
    this.conversations.push(conversation);
  }

  async list(): Promise<Conversation[]> {
    return this.conversations;
  }

  async findById(id: string): Promise<Conversation | undefined> {
    return this.conversations.find((c) => c.id === id);
  }

  async update(conversation: Conversation): Promise<void> {
    this.updated.push(conversation);
  }
}

describe("ContinueConversationUseCase", () => {
  it("throws ConversationNotFoundError and does not update when the conversation is missing", async () => {
    const coach = {
      continue: async () => "reply",
    } as unknown as ConversationCoachService;
    const repository = new FakeConversationRepository([]);
    const useCase = new ContinueConversationUseCase(coach, repository);

    await expect(
      useCase.execute("missing-id", "Explain that joke"),
    ).rejects.toBeInstanceOf(ConversationNotFoundError);
    expect(repository.updated).toEqual([]);
  });

  it("appends the user message and the coach's reply, then persists the conversation", async () => {
    const conversation = existingConversation();
    const coach = {
      continue: async () => "That joke works because of the timing.",
    } as unknown as ConversationCoachService;
    const repository = new FakeConversationRepository([conversation]);
    const useCase = new ContinueConversationUseCase(coach, repository);

    const result = await useCase.execute(conversation.id, "Explain that joke");

    expect(result.messages).toHaveLength(2);
    expect(result.messages[0]).toMatchObject({
      role: "user",
      content: "Explain that joke",
    });
    expect(result.messages[1]).toMatchObject({
      role: "assistant",
      content: "That joke works because of the timing.",
    });
    expect(repository.updated).toEqual([result]);
  });

  it("passes the conversation's scenario, suggestions, and prior messages to the coach", async () => {
    const priorMessages: Conversation["messages"] = [
      {
        id: "1",
        role: "user",
        content: "What's a good opener?",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ];
    const conversation = existingConversation({ messages: priorMessages });
    let receivedArgs: unknown[] = [];
    const coach = {
      continue: async (...args: unknown[]) => {
        receivedArgs = args;
        return "reply";
      },
    } as unknown as ConversationCoachService;
    const repository = new FakeConversationRepository([conversation]);
    const useCase = new ContinueConversationUseCase(coach, repository);

    await useCase.execute(conversation.id, "Explain that joke");

    const [scenario, suggestions, messages, message] = receivedArgs as [
      { description: string },
      SuggestionSet,
      Conversation["messages"],
      { text: string },
    ];
    expect(scenario.description).toBe(conversation.scenario.description);
    expect(suggestions).toEqual(conversation.suggestions);
    expect(messages).toEqual(priorMessages);
    expect(message.text).toBe("Explain that joke");
  });

  it("rejects an invalid message before touching the coach or the repository", async () => {
    const conversation = existingConversation();
    let coachCalled = false;
    const coach = {
      continue: async () => {
        coachCalled = true;
        return "reply";
      },
    } as unknown as ConversationCoachService;
    const repository = new FakeConversationRepository([conversation]);
    const useCase = new ContinueConversationUseCase(coach, repository);

    await expect(
      useCase.execute(conversation.id, "   "),
    ).rejects.toBeInstanceOf(InvalidUserMessageError);
    expect(coachCalled).toBe(false);
    expect(repository.updated).toEqual([]);
  });

  it("rejects a message longer than 1000 characters before touching the coach or the repository", async () => {
    const conversation = existingConversation();
    let coachCalled = false;
    const coach = {
      continue: async () => {
        coachCalled = true;
        return "reply";
      },
    } as unknown as ConversationCoachService;
    const repository = new FakeConversationRepository([conversation]);
    const useCase = new ContinueConversationUseCase(coach, repository);
    const tooLongMessage = "a".repeat(1001);

    await expect(
      useCase.execute(conversation.id, tooLongMessage),
    ).rejects.toBeInstanceOf(InvalidUserMessageError);
    expect(coachCalled).toBe(false);
    expect(repository.updated).toEqual([]);
  });
});
