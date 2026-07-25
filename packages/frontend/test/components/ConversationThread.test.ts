import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import type { Conversation, ConversationMessage } from "shared";
import ConversationThread from "../../src/components/ConversationThread.vue";
import { useConversationStore } from "../../src/store/conversationStore.js";

function message(id: string, role: ConversationMessage["role"], content: string): ConversationMessage {
  return { id, role, content, createdAt: "2026-01-01T00:00:00.000Z" };
}

function conversationWithMessages(messages: ConversationMessage[]): Conversation {
  return {
    id: "conversation-1",
    scenario: { description: "Coffee chat" },
    suggestions: { openers: [], jokes: [], talkingPoints: [], researchTopics: [] },
    messages,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("ConversationThread", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("renders nothing when there is no active conversation", () => {
    const wrapper = mount(ConversationThread);

    expect(wrapper.find("section").exists()).toBe(false);
  });

  it("shows an empty state when the conversation has no follow-up messages yet", () => {
    const store = useConversationStore();
    store.current = conversationWithMessages([]);

    const wrapper = mount(ConversationThread);

    expect(wrapper.text()).toContain("Ask a follow-up above");
  });

  it("shows the newest user/assistant pair first while preserving pair order", () => {
    const store = useConversationStore();
    store.current = conversationWithMessages([
      message("m1", "user", "Explain that joke"),
      message("m2", "assistant", "Because timing."),
      message("m3", "user", "Give me another one"),
      message("m4", "assistant", "Sure, here you go."),
    ]);

    const wrapper = mount(ConversationThread);
    const items = wrapper.findAll("li");

    expect(items.map((item) => item.text())).toEqual([
      "Give me another one",
      "Sure, here you go.",
      "Explain that joke",
      "Because timing.",
    ]);
    expect(items[0]?.classes()).toContain("user");
    expect(items[1]?.classes()).toContain("assistant");
  });
});
