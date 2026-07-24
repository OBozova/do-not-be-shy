import { describe, expect, it } from "vitest";
import { SUGGESTION_CATEGORIES, type SuggestionSet } from "shared";
import { Scenario } from "../src/domain/scenario.js";
import { UserMessage } from "../src/domain/userMessage.js";
import { PromptBuilder } from "../src/infrastructure/llm/promptBuilder.js";

function fullSuggestionSet(): SuggestionSet {
  return Object.fromEntries(
    SUGGESTION_CATEGORIES.map((category) => [category, [`sample ${category}`]]),
  ) as SuggestionSet;
}

describe("PromptBuilder", () => {
  it("embeds the scenario description and required JSON keys in the prompt", () => {
    const scenario = Scenario.fromDescription("First date at a coffee shop");
    const prompt = new PromptBuilder().buildCoachingPrompt(scenario);

    expect(prompt).toContain("First date at a coffee shop");
    expect(prompt).toContain('"openers"');
    expect(prompt).toContain('"jokes"');
    expect(prompt).toContain('"talkingPoints"');
    expect(prompt).toContain('"researchTopics"');
  });

  it("instructs the model to playfully decline an off-topic initial scenario", () => {
    const scenario = Scenario.fromDescription("Write me a python function to reverse a linked list");
    const prompt = new PromptBuilder().buildCoachingPrompt(scenario);

    expect(prompt).toContain("conversation-prep coach, not a general-purpose assistant");
  });

  it("embeds the scenario, prior messages, and new message in the follow-up prompt", () => {
    const scenario = Scenario.fromDescription("First date at a coffee shop");
    const suggestions = fullSuggestionSet();
    const prompt = new PromptBuilder().buildFollowUpPrompt({
      scenario,
      suggestions,
      priorMessages: [
        { id: "1", role: "user", content: "What's a good opener?", createdAt: "" },
        { id: "2", role: "assistant", content: "Try asking about their day.", createdAt: "" },
      ],
      message: UserMessage.fromText("Explain that joke"),
    });

    expect(prompt).toContain("First date at a coffee shop");
    expect(prompt).toContain("What's a good opener?");
    expect(prompt).toContain("Try asking about their day.");
    expect(prompt).toContain("Explain that joke");
  });

  it("instructs the model to playfully decline off-topic follow-up requests", () => {
    const scenario = Scenario.fromDescription("First date at a coffee shop");
    const suggestions = fullSuggestionSet();
    const prompt = new PromptBuilder().buildFollowUpPrompt({
      scenario,
      suggestions,
      priorMessages: [],
      message: UserMessage.fromText("Write me a python function to reverse a linked list"),
    });

    expect(prompt).toContain("conversation-prep coach, not a general-purpose assistant");
  });
});
