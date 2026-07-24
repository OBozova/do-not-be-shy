import type { ConversationMessage, SuggestionSet } from "shared";
import type { Scenario } from "../scenario.js";
import type { UserMessage } from "../userMessage.js";

export interface ContinueConversationInput {
  scenario: Scenario;
  suggestions: SuggestionSet;
  priorMessages: ConversationMessage[];
  message: UserMessage;
}

/**
 * Everything the domain needs from a language model, and nothing more.
 * Swapping providers (Ollama, OpenAI, a mock for tests) means writing one
 * new implementation of this interface — no other layer changes.
 */
export interface LlmPort {
  generateSuggestions(scenario: Scenario): Promise<SuggestionSet>;
  continueConversation(input: ContinueConversationInput): Promise<string>;
}
