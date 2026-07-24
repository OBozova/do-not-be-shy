import type { SuggestionSet } from "shared";
import type { Scenario } from "../../domain/scenario.js";
import type { LlmPort } from "../../domain/ports/llmPort.js";
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
    const raw = await this.callOllama(prompt);
    return this.parseAndValidate(raw.response);
  }

  private async callOllama(prompt: string): Promise<OllamaGenerateResponse> {
    try {
      const res = await fetch(`${this.host}/api/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          prompt,
          format: "json",
          stream: false,
        }),
      });
      if (!res.ok) {
        throw new Error(`Ollama responded with HTTP ${res.status}`);
      }
      return (await res.json()) as OllamaGenerateResponse;
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
