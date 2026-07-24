import type { SuggestionSet } from "shared";
import type { Scenario } from "../scenario.js";
import type { LlmPort } from "../ports/llmPort.js";
import { assertCompleteSuggestionSet } from "../suggestion.js";

/**
 * The domain service at the heart of the app: turns a Scenario into a
 * SuggestionSet. It depends only on the LlmPort abstraction, so it can be
 * exercised in tests with a fake model and swapped to any real provider
 * without changing a single line here.
 */
export class ConversationCoachService {
  constructor(private readonly llm: LlmPort) {}

  async coach(scenario: Scenario): Promise<SuggestionSet> {
    const suggestions = await this.llm.generateSuggestions(scenario);
    assertCompleteSuggestionSet(suggestions);
    return suggestions;
  }
}
