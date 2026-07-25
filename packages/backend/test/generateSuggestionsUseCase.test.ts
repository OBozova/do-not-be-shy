import { describe, expect, it } from "vitest";
import {
  SUGGESTION_CATEGORIES,
  type Conversation,
  type SuggestionSet,
} from "shared";
import { GenerateSuggestionsUseCase } from "../src/application/generateSuggestionsUseCase.js";
import { InvalidScenarioError } from "../src/domain/scenario.js";
import type { ConversationCoachService } from "../src/domain/services/conversationCoachService.js";
import type { ConversationRepository } from "../src/domain/ports/conversationRepository.js";

function fullSuggestionSet(): SuggestionSet {
  return Object.fromEntries(
    SUGGESTION_CATEGORIES.map((category) => [category, [`sample ${category}`]]),
  ) as SuggestionSet;
}

class FakeConversationRepository implements ConversationRepository {
  readonly conversations: Conversation[] = [];

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
    const index = this.conversations.findIndex((c) => c.id === conversation.id);
    this.conversations[index] = conversation;
  }
}

describe("GenerateSuggestionsUseCase", () => {
  it("creates and persists a new conversation seeded with the coach's suggestions", async () => {
    const suggestions = fullSuggestionSet();
    const coach = {
      coach: async () => suggestions,
    } as unknown as ConversationCoachService;
    const repository = new FakeConversationRepository();
    const useCase = new GenerateSuggestionsUseCase(coach, repository);

    const conversation = await useCase.execute({
      description: "Coffee chat with a new colleague",
    });

    expect(conversation.scenario).toEqual({
      description: "Coffee chat with a new colleague",
    });
    expect(conversation.suggestions).toEqual(suggestions);
    expect(conversation.messages).toEqual([]);
    expect(conversation.id).toBeTruthy();
    expect(conversation.createdAt).toBeTruthy();
    expect(repository.conversations).toEqual([conversation]);
  });

  it("rejects an invalid scenario before calling the coach or the repository", async () => {
    let coachCalled = false;
    const coach = {
      coach: async () => {
        coachCalled = true;
        return fullSuggestionSet();
      },
    } as unknown as ConversationCoachService;
    const repository = new FakeConversationRepository();
    const useCase = new GenerateSuggestionsUseCase(coach, repository);

    await expect(
      useCase.execute({ description: "   " }),
    ).rejects.toBeInstanceOf(InvalidScenarioError);

    expect(coachCalled).toBe(false);
    expect(repository.conversations).toEqual([]);
  });

  it("does not persist a conversation when the coach rejects", async () => {
    const coach = {
      coach: async () => {
        throw new Error("LLM is down");
      },
    } as unknown as ConversationCoachService;
    const repository = new FakeConversationRepository();
    const useCase = new GenerateSuggestionsUseCase(coach, repository);

    await expect(
      useCase.execute({ description: "Team lunch" }),
    ).rejects.toThrow("LLM is down");
    expect(repository.conversations).toEqual([]);
  });
});
