import { defineStore } from "pinia";
import type { HistoryEntry } from "shared";
import { ApiError, suggestionsApi } from "../api/suggestionsApi.js";

interface ConversationState {
  description: string;
  current: HistoryEntry | null;
  history: HistoryEntry[];
  isLoading: boolean;
  errorMessage: string | null;
}

export const useConversationStore = defineStore("conversation", {
  state: (): ConversationState => ({
    description: "",
    current: null,
    history: [],
    isLoading: false,
    errorMessage: null,
  }),

  actions: {
    async generateSuggestions(): Promise<void> {
      if (this.description.trim().length === 0) {
        return;
      }
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const entry = await suggestionsApi.generate({ description: this.description });
        this.current = entry;
        this.history.unshift(entry);
      } catch (error) {
        this.errorMessage = error instanceof ApiError ? error.message : "Something went wrong.";
      } finally {
        this.isLoading = false;
      }
    },

    async loadHistory(): Promise<void> {
      try {
        this.history = await suggestionsApi.listHistory();
      } catch {
        // History is a nice-to-have; a failed load shouldn't block the main flow.
      }
    },

    selectHistoryEntry(entry: HistoryEntry): void {
      this.current = entry;
      this.description = entry.scenario.description;
    },
  },
});
