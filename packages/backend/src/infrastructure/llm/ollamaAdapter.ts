import type { SuggestionSet } from "shared";
import type { Scenario } from "../../domain/scenario.js";
import type { ContinueConversationInput, LlmPort } from "../../domain/ports/llmPort.js";
import { LlmUnavailableError, InvalidLlmResponseError } from "../../domain/errors.js";
import { PromptBuilder } from "./promptBuilder.js";
import { suggestionSetSchema } from "./suggestionSchema.js";

interface OllamaGenerateResponse {
  response: string;
}

/**
 * The only place in the app that knows Ollama's HTTP API exists. Implements
 * LlmPort, so ConversationCoachService never sees this class directly —
 * swapping to a different provider means writing a new adapter, not touching
 * the domain.
 */
export class OllamaAdapter implements LlmPort {
  private readonly promptBuilder = new PromptBuilder();

  constructor(
    private readonly host: string,
    private readonly model: string,
  ) {}

  async generateSuggestions(scenario: Scenario): Promise<SuggestionSet> {
    const prompt = this.promptBuilder.buildCoachingPrompt(scenario);
    const raw = await this.callOllama(prompt, { json: true });
    return this.parseAndValidate(raw);
  }

  async continueConversation(input: ContinueConversationInput): Promise<string> {
    const prompt = this.promptBuilder.buildFollowUpPrompt(input);
    return this.callOllama(prompt, { json: false });
  }

  private async callOllama(prompt: string, opts: { json: boolean }): Promise<string> {
    try {
      const res = await fetch(`${this.host}/api/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          prompt,
          ...(opts.json ? { format: "json" } : {}),
          stream: false,
        }),
      });
      if (!res.ok) {
        throw new Error(`Ollama responded with HTTP ${res.status}`);
      }
      const body = (await res.json()) as OllamaGenerateResponse;
      return body.response;
    } catch (cause) {
      throw new LlmUnavailableError(cause);
    }
  }

  private parseAndValidate(rawResponse: string): SuggestionSet {
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawResponse);
    } catch (cause) {
      throw new InvalidLlmResponseError("model output was not valid JSON", cause);
    }

    const result = suggestionSetSchema.safeParse(parsedJson);
    if (!result.success) {
      throw new InvalidLlmResponseError(result.error.message, result.error);
    }

    return result.data;
  }
}
