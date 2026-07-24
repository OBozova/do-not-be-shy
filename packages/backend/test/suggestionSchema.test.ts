import { describe, expect, it } from "vitest";
import { suggestionSetSchema } from "../src/infrastructure/llm/suggestionSchema.js";

describe("suggestionSetSchema", () => {
  it("accepts a well-formed suggestion set", () => {
    const result = suggestionSetSchema.safeParse({
      openers: ["Hi!"],
      jokes: ["Why did..."],
      talkingPoints: ["Ask about their work"],
      researchTopics: ["Company mission"],
    });

    expect(result.success).toBe(true);
  });

  it("rejects a response missing a required category", () => {
    const result = suggestionSetSchema.safeParse({
      openers: ["Hi!"],
      jokes: ["Why did..."],
      talkingPoints: ["Ask about their work"],
    });

    expect(result.success).toBe(false);
  });

  it("rejects a category that isn't an array of strings", () => {
    const result = suggestionSetSchema.safeParse({
      openers: "Hi!",
      jokes: ["Why did..."],
      talkingPoints: ["Ask about their work"],
      researchTopics: ["Company mission"],
    });

    expect(result.success).toBe(false);
  });
});
