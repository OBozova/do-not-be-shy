import { describe, expect, it } from "vitest";
import { SUGGESTION_CATEGORIES, type SuggestionSet } from "shared";
import { Scenario } from "../src/domain/scenario.js";
import { ConversationCoachService } from "../src/domain/services/conversationCoachService.js";
import { EmptySuggestionSetError } from "../src/domain/suggestion.js";
import type { LlmPort } from "../src/domain/ports/llmPort.js";

class FakeLlmPort implements LlmPort {
  constructor(private readonly response: SuggestionSet) {}

  async generateSuggestions(): Promise<SuggestionSet> {
    return this.response;
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
});
