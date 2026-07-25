import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Conversation } from "shared";
import { ApiError, conversationsApi } from "../src/api/conversationsApi.js";

function sampleConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: "conversation-1",
    scenario: { description: "Coffee chat with a new colleague" },
    suggestions: { openers: [], jokes: [], talkingPoints: [], researchTopics: [] },
    messages: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("conversationsApi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts a scenario description and returns the created conversation", async () => {
    const conversation = sampleConversation();
    vi.mocked(fetch).mockResolvedValue(jsonResponse(conversation));

    const result = await conversationsApi.create({ description: "Coffee chat" });

    expect(fetch).toHaveBeenCalledWith(
      "/api/conversations",
      expect.objectContaining({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ description: "Coffee chat" }),
      }),
    );
    expect(result).toEqual(conversation);
  });

  it("lists conversations from the history endpoint", async () => {
    const conversations = [sampleConversation(), sampleConversation({ id: "conversation-2" })];
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ conversations }));

    const result = await conversationsApi.list();

    expect(fetch).toHaveBeenCalledWith("/api/conversations");
    expect(result).toEqual(conversations);
  });

  it("posts a follow-up message to the conversation's message endpoint", async () => {
    const conversation = sampleConversation();
    vi.mocked(fetch).mockResolvedValue(jsonResponse(conversation));

    const result = await conversationsApi.continue("conversation-1", "Explain that joke");

    expect(fetch).toHaveBeenCalledWith(
      "/api/conversations/conversation-1/messages",
      expect.objectContaining({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Explain that joke" }),
      }),
    );
    expect(result).toEqual(conversation);
  });

  it("throws an ApiError with the server-provided message on a non-ok response", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ error: "not_found", message: "Conversation not found." }, 404),
    );

    await expect(conversationsApi.list()).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      message: "Conversation not found.",
    });
  });

  it("falls back to the response status text when the error body isn't JSON", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response("<not json>", { status: 500, statusText: "Internal Server Error" }),
    );

    const error = await conversationsApi.list().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(500);
    expect((error as ApiError).message).toBe("Internal Server Error");
  });
});
