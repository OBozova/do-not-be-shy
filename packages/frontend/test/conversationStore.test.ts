import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Conversation } from "shared";
import { ApiError } from "../src/api/conversationsApi.js";

const { conversationsApi } = vi.hoisted(() => ({
  conversationsApi: {
    create: vi.fn(),
    list: vi.fn(),
    continue: vi.fn(),
  },
}));

vi.mock("../src/api/conversationsApi.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/api/conversationsApi.js")>();
  return { ...actual, conversationsApi };
});

import { useConversationStore } from "../src/store/conversationStore.js";

function sampleConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: "conversation-1",
    scenario: { description: "Coffee chat with a new colleague" },
    suggestions: { openers: ["Hi!"], jokes: [], talkingPoints: [], researchTopics: [] },
    messages: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("conversationStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe("generateSuggestions / submit", () => {
    it("does nothing for a blank description", async () => {
      const store = useConversationStore();
      store.description = "   ";

      await store.submit();

      expect(conversationsApi.create).not.toHaveBeenCalled();
    });

    it("creates a conversation, prepends it to history, and clears the description", async () => {
      const store = useConversationStore();
      const conversation = sampleConversation();
      conversationsApi.create.mockResolvedValue(conversation);
      store.description = "Coffee chat with a new colleague";

      await store.submit();

      expect(conversationsApi.create).toHaveBeenCalledWith({
        description: "Coffee chat with a new colleague",
      });
      expect(store.current).toEqual(conversation);
      expect(store.history).toEqual([conversation]);
      expect(store.description).toBe("");
      expect(store.isLoading).toBe(false);
      expect(store.errorMessage).toBeNull();
    });

    it("surfaces the ApiError message on failure", async () => {
      const store = useConversationStore();
      conversationsApi.create.mockRejectedValue(new ApiError(400, "Description is required."));
      store.description = "anything";

      await store.submit();

      expect(store.errorMessage).toBe("Description is required.");
      expect(store.current).toBeNull();
      expect(store.isLoading).toBe(false);
    });

    it("falls back to a generic message for non-ApiError failures", async () => {
      const store = useConversationStore();
      conversationsApi.create.mockRejectedValue(new Error("network down"));
      store.description = "anything";

      await store.submit();

      expect(store.errorMessage).toBe("Something went wrong.");
    });
  });

  describe("sendFollowUp / submit", () => {
    it("does nothing without an active conversation", async () => {
      const store = useConversationStore();
      store.description = "Explain that joke";

      await store.submit();

      expect(conversationsApi.continue).not.toHaveBeenCalled();
    });

    it("sends a follow-up, updates current and the matching history entry", async () => {
      const store = useConversationStore();
      const original = sampleConversation();
      store.current = original;
      store.history = [original];
      store.description = "Explain that joke";

      const updated = sampleConversation({
        messages: [
          { id: "m1", role: "user", content: "Explain that joke", createdAt: "now" },
          { id: "m2", role: "assistant", content: "Because timing.", createdAt: "now" },
        ],
      });
      conversationsApi.continue.mockResolvedValue(updated);

      await store.submit();

      expect(conversationsApi.continue).toHaveBeenCalledWith("conversation-1", "Explain that joke");
      expect(store.current).toEqual(updated);
      expect(store.history[0]).toEqual(updated);
      expect(store.description).toBe("");
      expect(store.isSendingFollowUp).toBe(false);
    });

    it("surfaces the ApiError message on failure via followUpErrorMessage", async () => {
      const store = useConversationStore();
      store.current = sampleConversation();
      store.description = "Explain that joke";
      conversationsApi.continue.mockRejectedValue(new ApiError(404, "Conversation not found."));

      await store.submit();

      expect(store.followUpErrorMessage).toBe("Conversation not found.");
    });
  });

  describe("loadHistory", () => {
    it("populates history on success", async () => {
      const store = useConversationStore();
      const conversations = [sampleConversation()];
      conversationsApi.list.mockResolvedValue(conversations);

      await store.loadHistory();

      expect(store.history).toEqual(conversations);
    });

    it("silently ignores failures", async () => {
      const store = useConversationStore();
      conversationsApi.list.mockRejectedValue(new Error("network down"));

      await expect(store.loadHistory()).resolves.toBeUndefined();
      expect(store.history).toEqual([]);
    });
  });

  describe("selectHistoryEntry / startNewConversation", () => {
    it("selects a history entry and clears transient state", () => {
      const store = useConversationStore();
      const entry = sampleConversation();
      store.description = "leftover text";
      store.errorMessage = "old error";
      store.followUpErrorMessage = "old follow-up error";

      store.selectHistoryEntry(entry);

      expect(store.current).toEqual(entry);
      expect(store.description).toBe("");
      expect(store.errorMessage).toBeNull();
      expect(store.followUpErrorMessage).toBeNull();
    });

    it("resets to a blank conversation", () => {
      const store = useConversationStore();
      store.current = sampleConversation();
      store.description = "leftover text";
      store.errorMessage = "old error";
      store.followUpErrorMessage = "old follow-up error";

      store.startNewConversation();

      expect(store.current).toBeNull();
      expect(store.description).toBe("");
      expect(store.errorMessage).toBeNull();
      expect(store.followUpErrorMessage).toBeNull();
    });
  });
});
