import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Conversation } from "shared";
import HistoryPanel from "../../src/components/HistoryPanel.vue";
import { useConversationStore } from "../../src/store/conversationStore.js";

function conversationWithDescription(id: string, description: string): Conversation {
  return {
    id,
    scenario: { description },
    suggestions: { openers: [], jokes: [], talkingPoints: [], researchTopics: [] },
    messages: [],
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("HistoryPanel", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("loads history on mount", () => {
    const store = useConversationStore();
    const loadHistorySpy = vi.spyOn(store, "loadHistory").mockResolvedValue();

    mount(HistoryPanel);

    expect(loadHistorySpy).toHaveBeenCalledOnce();
  });

  it("shows an empty state when there is no history", () => {
    const store = useConversationStore();
    vi.spyOn(store, "loadHistory").mockResolvedValue();

    const wrapper = mount(HistoryPanel);

    expect(wrapper.text()).toContain("Past situations will show up here.");
  });

  it("truncates long descriptions to a word-count preview", () => {
    const store = useConversationStore();
    vi.spyOn(store, "loadHistory").mockResolvedValue();
    store.history = [
      conversationWithDescription(
        "conversation-1",
        "Job interview with two people at an AI startup, technical round",
      ),
    ];

    const wrapper = mount(HistoryPanel);

    expect(wrapper.find("li").text()).toBe("Job interview with two people at…");
  });

  it("does not truncate short descriptions", () => {
    const store = useConversationStore();
    vi.spyOn(store, "loadHistory").mockResolvedValue();
    store.history = [conversationWithDescription("conversation-1", "Coffee chat")];

    const wrapper = mount(HistoryPanel);

    expect(wrapper.find("li").text()).toBe("Coffee chat");
  });

  it("marks the active entry and selects an entry on click", async () => {
    const store = useConversationStore();
    vi.spyOn(store, "loadHistory").mockResolvedValue();
    const entryOne = conversationWithDescription("conversation-1", "Coffee chat");
    const entryTwo = conversationWithDescription("conversation-2", "Team lunch");
    store.history = [entryOne, entryTwo];
    store.current = entryOne;
    const selectSpy = vi.spyOn(store, "selectHistoryEntry");

    const wrapper = mount(HistoryPanel);
    const items = wrapper.findAll("li");

    expect(items[0]?.classes()).toContain("active");
    expect(items[1]?.classes()).not.toContain("active");

    await items[1]?.trigger("click");

    expect(selectSpy).toHaveBeenCalledWith(entryTwo);
  });
});
