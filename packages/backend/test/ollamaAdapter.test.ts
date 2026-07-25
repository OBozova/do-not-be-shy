import { afterEach, describe, expect, it, vi } from "vitest";
import { Scenario } from "../src/domain/scenario.js";
import { UserMessage } from "../src/domain/userMessage.js";
import { InvalidLlmResponseError, LlmUnavailableError } from "../src/domain/errors.js";
import { OllamaAdapter } from "../src/infrastructure/llm/ollamaAdapter.js";

function stubFetchReturning(response: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ response }),
    }),
  );
}

function stubFetchWithStatus(status: number) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: false,
      status,
      json: async () => ({ response: "" }),
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("OllamaAdapter", () => {
  it("wraps a fetch failure in LlmUnavailableError for generateSuggestions", async () => {
    const networkError = new Error("connect ECONNREFUSED");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(networkError));
    const adapter = new OllamaAdapter("http://localhost:11434", "llama3.2");

    const error: unknown = await adapter
      .generateSuggestions(Scenario.fromDescription("Coffee chat with a new colleague"))
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(LlmUnavailableError);
    expect((error as LlmUnavailableError).cause).toBe(networkError);
  });

  it("wraps a fetch failure in LlmUnavailableError for continueConversation", async () => {
    const networkError = new Error("connect ECONNREFUSED");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(networkError));
    const adapter = new OllamaAdapter("http://localhost:11434", "llama3.2");
    const scenario = Scenario.fromDescription("Coffee chat with a new colleague");

    const error: unknown = await adapter
      .continueConversation({
        scenario,
        suggestions: {
          openers: ["Hi there!"],
          jokes: ["Sample joke"],
          talkingPoints: ["Sample point"],
          researchTopics: ["Sample topic"],
        },
        priorMessages: [],
        message: UserMessage.fromText("Explain that joke"),
      })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(LlmUnavailableError);
    expect((error as LlmUnavailableError).cause).toBe(networkError);
  });

  it("wraps a non-ok HTTP response (e.g. 502 Bad Gateway) in LlmUnavailableError", async () => {
    stubFetchWithStatus(502);
    const adapter = new OllamaAdapter("http://localhost:11434", "llama3.2");

    const error: unknown = await adapter
      .generateSuggestions(Scenario.fromDescription("Coffee chat with a new colleague"))
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(LlmUnavailableError);
    expect((error as LlmUnavailableError).cause).toBeInstanceOf(Error);
    expect(((error as LlmUnavailableError).cause as Error).message).toContain("502");
  });

  it("rejects with InvalidLlmResponseError when the model response is not valid JSON", async () => {
    stubFetchReturning("not valid json {");
    const adapter = new OllamaAdapter("http://localhost:11434", "llama3.2");

    const error: unknown = await adapter
      .generateSuggestions(Scenario.fromDescription("Coffee chat with a new colleague"))
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(InvalidLlmResponseError);
    expect((error as InvalidLlmResponseError).message).toContain("not valid JSON");
  });

  it("rejects with InvalidLlmResponseError when the parsed JSON doesn't match the suggestion schema", async () => {
    stubFetchReturning(
      JSON.stringify({
        jokes: ["Sample joke"],
        talkingPoints: ["Sample point"],
        researchTopics: ["Sample topic"],
      }),
    );
    const adapter = new OllamaAdapter("http://localhost:11434", "llama3.2");

    const error: unknown = await adapter
      .generateSuggestions(Scenario.fromDescription("Coffee chat with a new colleague"))
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(InvalidLlmResponseError);
  });

  it("returns the parsed suggestion set when the model response is valid", async () => {
    const suggestions = {
      openers: ["Hi there!", "How's your day going?"],
      jokes: ["Sample joke"],
      talkingPoints: ["Sample point"],
      researchTopics: ["Sample topic"],
    };
    stubFetchReturning(JSON.stringify(suggestions));
    const adapter = new OllamaAdapter("http://localhost:11434", "llama3.2");

    const result = await adapter.generateSuggestions(
      Scenario.fromDescription("Coffee chat with a new colleague"),
    );

    expect(result).toEqual(suggestions);
  });
});
