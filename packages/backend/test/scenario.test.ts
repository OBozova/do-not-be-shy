import { describe, expect, it } from "vitest";
import { InvalidScenarioError, Scenario } from "../src/domain/scenario.js";

describe("Scenario.fromDescription", () => {
  it("trims surrounding whitespace from a valid description", () => {
    const scenario = Scenario.fromDescription("  First date at a coffee shop  ");

    expect(scenario.description).toBe("First date at a coffee shop");
  });

  it("rejects an empty description", () => {
    expect(() => Scenario.fromDescription("   ")).toThrow(InvalidScenarioError);
  });

  it("rejects a description longer than 2000 characters", () => {
    const tooLong = "a".repeat(2001);

    expect(() => Scenario.fromDescription(tooLong)).toThrow(InvalidScenarioError);
    expect(() => Scenario.fromDescription(tooLong)).toThrow(/too long/);
  });

  it("accepts a description exactly at the 2000 character limit", () => {
    const atLimit = "a".repeat(2000);

    expect(Scenario.fromDescription(atLimit).description).toHaveLength(2000);
  });
});
