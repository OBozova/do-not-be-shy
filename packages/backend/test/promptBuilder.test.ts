import { describe, expect, it } from "vitest";
import { Scenario } from "../src/domain/scenario.js";
import { PromptBuilder } from "../src/infrastructure/llm/promptBuilder.js";

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
});
