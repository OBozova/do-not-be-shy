import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ConversationInput from "../../src/components/ConversationInput.vue";
import { useConversationStore } from "../../src/store/conversationStore.js";

describe("ConversationInput", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("shows the initial placeholder and label before a conversation exists", () => {
    const wrapper = mount(ConversationInput);

    expect(wrapper.find("label").exists()).toBe(true);
    expect(wrapper.find("textarea").attributes("placeholder")).toContain(
      "Job interview with two people",
    );
    expect(wrapper.find("button[type=submit]").text()).toBe("Get suggestions");
  });

  it("switches to follow-up copy once a conversation is active", () => {
    const store = useConversationStore();
    store.current = {
      id: "conversation-1",
      scenario: { description: "Coffee chat" },
      suggestions: { openers: [], jokes: [], talkingPoints: [], researchTopics: [] },
      messages: [],
      createdAt: "2026-01-01T00:00:00.000Z",
    };

    const wrapper = mount(ConversationInput);

    expect(wrapper.find("label").exists()).toBe(false);
    expect(wrapper.find("textarea").attributes("placeholder")).toContain("Ask a follow-up");
    expect(wrapper.find("button[type=submit]").text()).toBe("Send");
    expect(wrapper.find("button.secondary").exists()).toBe(true);
  });

  it("disables submit while the description is blank and enables it once text is entered", async () => {
    const wrapper = mount(ConversationInput);
    const submitButton = wrapper.find("button[type=submit]");

    expect(submitButton.attributes("disabled")).toBeDefined();

    await wrapper.find("textarea").setValue("Coffee chat with a new colleague");

    expect(submitButton.attributes("disabled")).toBeUndefined();
  });

  it("calls store.submit on form submit", async () => {
    const store = useConversationStore();
    const submitSpy = vi.spyOn(store, "submit").mockResolvedValue();
    const wrapper = mount(ConversationInput);

    await wrapper.find("textarea").setValue("Coffee chat with a new colleague");
    await wrapper.find("form").trigger("submit");

    expect(submitSpy).toHaveBeenCalledOnce();
  });

  it("submits on Enter but not on Shift+Enter", async () => {
    const store = useConversationStore();
    const submitSpy = vi.spyOn(store, "submit").mockResolvedValue();
    const wrapper = mount(ConversationInput);
    const textarea = wrapper.find("textarea");
    await textarea.setValue("Coffee chat with a new colleague");

    await textarea.trigger("keydown", { key: "Enter", shiftKey: true });
    expect(submitSpy).not.toHaveBeenCalled();

    await textarea.trigger("keydown", { key: "Enter", shiftKey: false });
    expect(submitSpy).toHaveBeenCalledOnce();
  });

  it("does not submit on Enter when the description is blank", async () => {
    const store = useConversationStore();
    const submitSpy = vi.spyOn(store, "submit").mockResolvedValue();
    const wrapper = mount(ConversationInput);

    await wrapper.find("textarea").trigger("keydown", { key: "Enter" });

    expect(submitSpy).not.toHaveBeenCalled();
  });

  it("renders an error message from either error field", () => {
    const store = useConversationStore();
    store.followUpErrorMessage = "Conversation not found.";

    const wrapper = mount(ConversationInput);

    expect(wrapper.find(".error").text()).toBe("Conversation not found.");
  });

  it("clicking 'New conversation' calls startNewConversation", async () => {
    const store = useConversationStore();
    store.current = {
      id: "conversation-1",
      scenario: { description: "Coffee chat" },
      suggestions: { openers: [], jokes: [], talkingPoints: [], researchTopics: [] },
      messages: [],
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    const startNewSpy = vi.spyOn(store, "startNewConversation");
    const wrapper = mount(ConversationInput);

    await wrapper.find("button.secondary").trigger("click");

    expect(startNewSpy).toHaveBeenCalledOnce();
  });
});
