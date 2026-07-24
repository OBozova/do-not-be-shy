import { defineStore } from "pinia";
import type { Conversation } from "shared";
import { ApiError, conversationsApi } from "../api/conversationsApi.js";

interface ConversationState {
  description: string;
  current: Conversation | null;
  history: Conversation[];
  isLoading: boolean;
  errorMessage: string | null;
  isSendingFollowUp: boolean;
  followUpErrorMessage: string | null;
}

export const useConversationStore = defineStore("conversation", {
  state: (): ConversationState => ({
    description: "",
    current: null,
    history: [],
    isLoading: false,
    errorMessage: null,
    isSendingFollowUp: false,
    followUpErrorMessage: null,
  }),

  actions: {
    async generateSuggestions(): Promise<void> {
      if (this.description.trim().length === 0) {
        return;
      }
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const conversation = await conversationsApi.create({ description: this.description });
        this.current = conversation;
        this.history.unshift(conversation);
      } catch (error) {
        this.errorMessage = error instanceof ApiError ? error.message : "Something went wrong.";
      } finally {
        this.isLoading = false;
      }
    },

    async loadHistory(): Promise<void> {
      try {
        this.history = await conversationsApi.list();
      } catch {
        // History is a nice-to-have; a failed load shouldn't block the main flow.
      }
    },

    selectHistoryEntry(entry: Conversation): void {
      this.current = entry;
      this.description = entry.scenario.description;
    },

    async sendFollowUp(message: string): Promise<void> {
      if (!this.current || message.trim().length === 0) {
        return;
      }
      this.isSendingFollowUp = true;
      this.followUpErrorMessage = null;
      try {
        const updated = await conversationsApi.continue(this.current.id, message);
        this.current = updated;
        const index = this.history.findIndex((c) => c.id === updated.id);
        if (index !== -1) {
          this.history[index] = updated;
        }
      } catch (error) {
        this.followUpErrorMessage =
          error instanceof ApiError ? error.message : "Something went wrong.";
      } finally {
        this.isSendingFollowUp = false;
      }
    },
  },
});
