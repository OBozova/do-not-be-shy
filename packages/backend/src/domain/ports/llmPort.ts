import type { SuggestionSet } from "shared";
import type { Scenario } from "../scenario.js";

/**
 * Everything the domain needs from a language model, and nothing more.
 * Swapping providers (Ollama, OpenAI, a mock for tests) means writing one
 * new implementation of this interface — no other layer changes.
 */
export interface LlmPort {
  generateSuggestions(scenario: Scenario): Promise<SuggestionSet>;
}
