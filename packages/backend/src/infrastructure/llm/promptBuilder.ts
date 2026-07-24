import type { ConversationMessage } from "shared";
import type { Scenario } from "../../domain/scenario.js";
import type { ContinueConversationInput } from "../../domain/ports/llmPort.js";

const RESPONSE_INSTRUCTIONS = `Respond with ONLY a JSON object with exactly these four keys, each an array of 3-5 short strings:
- "openers": natural, low-pressure conversation openers to start with
- "jokes": light, safe-for-work jokes or playful remarks that fit the situation
- "talkingPoints": interesting topics worth bringing up during the conversation
- "researchTopics": specific things worth looking up or preparing before arriving

Keep every string concise (max ~160 characters), concrete, and tailored to the situation below. Do not include any text outside the JSON object.`;

const FOLLOW_UP_INSTRUCTIONS = `Reply in plain conversational text — no JSON, no markdown headers, just a warm, direct answer to the message below.

You are a conversation-prep coach, not a general-purpose assistant. If the message asks for something unrelated to preparing for this situation — writing or debugging code, a recipe, homework help, or anything else off-topic — don't do it. Instead, give a short, playful reply making clear that's not what you're here for, and steer things back to the situation at hand.`;

/**
 * Turns a Scenario (or an ongoing conversation) into the actual text sent to
 * the model. Kept as its own class so prompt wording can evolve (or be A/B'd)
 * without touching the adapter that talks to Ollama.
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

  buildFollowUpPrompt(input: ContinueConversationInput): string {
    return [
      "You are a warm, encouraging conversation coach helping someone who may feel nervous or shy prepare for an upcoming situation.",
      "",
      `Situation: ${input.scenario.description}`,
      "",
      "You already gave them this coaching:",
      JSON.stringify(input.suggestions, null, 2),
      "",
      ...this.renderTranscript(input.priorMessages),
      `User: ${input.message.text}`,
      "",
      FOLLOW_UP_INSTRUCTIONS,
    ].join("\n");
  }

  private renderTranscript(priorMessages: ConversationMessage[]): string[] {
    if (priorMessages.length === 0) {
      return [];
    }
    const lines = priorMessages.map(
      (message) => `${message.role === "user" ? "User" : "You"}: ${message.content}`,
    );
    return [...lines, ""];
  }
}
