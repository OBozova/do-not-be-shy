import type { ConversationMessage, SuggestionSet } from "shared";
import type { Scenario } from "../scenario.js";
import type { UserMessage } from "../userMessage.js";
import type { LlmPort } from "../ports/llmPort.js";
import { assertCompleteSuggestionSet } from "../suggestion.js";
import { EmptyReplyError } from "../errors.js";

/**
 * The domain service at the heart of the app: turns a Scenario into a
 * SuggestionSet, and later, follow-up messages into replies. It depends only
 * on the LlmPort abstraction, so it can be exercised in tests with a fake
 * model and swapped to any real provider without changing a single line here.
 */
export class ConversationCoachService {
  constructor(private readonly llm: LlmPort) {}

  async coach(scenario: Scenario): Promise<SuggestionSet> {
    const suggestions = await this.llm.generateSuggestions(scenario);
    assertCompleteSuggestionSet(suggestions);
    return suggestions;
  }

  async continue(
    scenario: Scenario,
    suggestions: SuggestionSet,
    priorMessages: ConversationMessage[],
    message: UserMessage,
  ): Promise<string> {
    const reply = await this.llm.continueConversation({
      scenario,
      suggestions,
      priorMessages,
      message,
    });
    const trimmedReply = reply.trim();
    if (trimmedReply.length === 0) {
      throw new EmptyReplyError();
    }
    return trimmedReply;
  }
}
