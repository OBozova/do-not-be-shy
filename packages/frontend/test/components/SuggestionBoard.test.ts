import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import type { Conversation } from "shared";
import { SUGGESTION_CATEGORY_LABELS } from "shared";
import SuggestionBoard from "../../src/components/SuggestionBoard.vue";
import { useConversationStore } from "../../src/store/conversationStore.js";

function sampleConversation(): Conversation {
  return {
    id: "conversation-1",
    scenario: { description: "Coffee chat" },
    suggestions: {
      openers: ["Hi there!"],
      jokes: ["Why did the chicken..."],
      talkingPoints: ["Recent project launches"],
      researchTopics: ["Company mission"],
    },
    messages: [],
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("SuggestionBoard", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("shows a loading message while suggestions are being generated", () => {
    const store = useConversationStore();
    store.isLoading = true;

    const wrapper = mount(SuggestionBoard);

    expect(wrapper.text()).toContain("Coaching in progress");
    expect(wrapper.findComponent({ name: "SuggestionCard" }).exists()).toBe(false);
  });

  it("shows an empty state when there is no active conversation", () => {
    const wrapper = mount(SuggestionBoard);

    expect(wrapper.text()).toContain("Describe a situation above");
  });

  it("renders one card per suggestion category once a conversation exists", () => {
    const store = useConversationStore();
    store.current = sampleConversation();

    const wrapper = mount(SuggestionBoard);

    const titles = wrapper.findAll("h3").map((h3) => h3.text());
    expect(titles).toEqual(Object.values(SUGGESTION_CATEGORY_LABELS));
  });
});
