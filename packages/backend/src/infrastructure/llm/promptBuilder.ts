import type { Scenario } from "../../domain/scenario.js";

const RESPONSE_INSTRUCTIONS = `Respond with ONLY a JSON object with exactly these four keys, each an array of 3-5 short strings:
- "openers": natural, low-pressure conversation openers to start with
- "jokes": light, safe-for-work jokes or playful remarks that fit the situation
- "talkingPoints": interesting topics worth bringing up during the conversation
- "researchTopics": specific things worth looking up or preparing before arriving

Keep every string concise (max ~160 characters), concrete, and tailored to the situation below. Do not include any text outside the JSON object.`;

/**
 * Turns a Scenario into the actual text sent to the model. Kept as its own
 * class so prompt wording can evolve (or be A/B'd) without touching the
 * adapter that talks to Ollama.
 */
export class PromptBuilder {
  buildCoachingPrompt(scenario: Scenario): string {
    return [
      "You are a warm, encouraging conversation coach helping someone who may feel nervous or shy prepare for an upcoming situation.",
      "",
      `Situation: ${scenario.description}`,
      "",
      RESPONSE_INSTRUCTIONS,
    ].join("\n");
  }
}
