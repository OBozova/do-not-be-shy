import { describe, expect, it } from "vitest";
import { SUGGESTION_CATEGORIES, type SuggestionSet } from "shared";
import { Scenario } from "../src/domain/scenario.js";
import { UserMessage } from "../src/domain/userMessage.js";
import { ConversationCoachService } from "../src/domain/services/conversationCoachService.js";
import { EmptySuggestionSetError } from "../src/domain/suggestion.js";
import { EmptyReplyError } from "../src/domain/errors.js";
import type { ContinueConversationInput, LlmPort } from "../src/domain/ports/llmPort.js";

class FakeLlmPort implements LlmPort {
  constructor(
    private readonly response: SuggestionSet,
    private readonly reply: string = "Here's an explanation.",
  ) {}

  async generateSuggestions(): Promise<SuggestionSet> {
    return this.response;
  }

  async continueConversation(_input: ContinueConversationInput): Promise<string> {
    return this.reply;
  }
}

function fullSuggestionSet(overrides: Partial<SuggestionSet> = {}): SuggestionSet {
  const base = Object.fromEntries(
    SUGGESTION_CATEGORIES.map((category) => [category, [`sample ${category}`]]),
  ) as SuggestionSet;
  return { ...base, ...overrides };
}

describe("ConversationCoachService", () => {
  it("returns the suggestion set produced by the LLM port", async () => {
    const suggestions = fullSuggestionSet({ openers: ["Hi there!", "How's your day going?"] });
    const service = new ConversationCoachService(new FakeLlmPort(suggestions));

    const result = await service.coach(
      Scenario.fromDescription("Coffee chat with a new colleague"),
    );

    expect(result).toEqual(suggestions);
  });

  it("rejects a suggestion set missing a category's content", async () => {
    const suggestions = fullSuggestionSet({ jokes: [] });
    const service = new ConversationCoachService(new FakeLlmPort(suggestions));

    await expect(service.coach(Scenario.fromDescription("Team lunch"))).rejects.toBeInstanceOf(
      EmptySuggestionSetError,
    );
  });

  it("returns the reply produced by the LLM port for a follow-up message", async () => {
    const suggestions = fullSuggestionSet();
    const service = new ConversationCoachService(
      new FakeLlmPort(suggestions, "That joke works because of the timing."),
    );

    const reply = await service.continue(
      Scenario.fromDescription("Coffee chat with a new colleague"),
      suggestions,
      [],
      UserMessage.fromText("Explain that joke"),
    );

    expect(reply).toBe("That joke works because of the timing.");
  });

  it("rejects an empty reply from the LLM port", async () => {
    const suggestions = fullSuggestionSet();
    const service = new ConversationCoachService(new FakeLlmPort(suggestions, "   "));

    await expect(
      service.continue(
        Scenario.fromDescription("Team lunch"),
        suggestions,
        [],
        UserMessage.fromText("Explain that joke"),
      ),
    ).rejects.toBeInstanceOf(EmptyReplyError);
  });
});
