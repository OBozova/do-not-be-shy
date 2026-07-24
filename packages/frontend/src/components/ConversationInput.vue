<script setup lang="ts">
import { computed } from "vue";
import { useConversationStore } from "../store/conversationStore.js";

const store = useConversationStore();

const isBusy = computed(() => store.isLoading || store.isSendingFollowUp);

const placeholder = computed(() =>
  store.current
    ? 'Ask a follow-up — e.g. "explain that joke" or "give me a few more talking points"…'
    : "e.g. Job interview with two people at an AI startup, technical challenge round, casual atmosphere",
);

const buttonLabel = computed(() => {
  if (isBusy.value) {
    return store.current ? "Sending…" : "Thinking…";
  }
  return store.current ? "Send" : "Get suggestions";
});

const errorMessage = computed(() => store.errorMessage ?? store.followUpErrorMessage);

function onSubmit(): void {
  void store.submit();
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    if (!isBusy.value && store.description.trim().length > 0) {
      onSubmit();
    }
  }
}
</script>

<template>
  <form class="conversation-input" @submit.prevent="onSubmit">
    <label v-if="!store.current" for="description">Describe the situation you're walking into</label>
    <textarea
      id="description"
      v-model="store.description"
      rows="3"
      :placeholder="placeholder"
      @keydown="onKeydown"
    />
    <div class="actions">
      <button type="submit" :disabled="isBusy || store.description.trim().length === 0">
        {{ buttonLabel }}
      </button>
      <button
        v-if="store.current"
        type="button"
        class="secondary"
        @click="store.startNewConversation()"
      >
        New conversation
      </button>
    </div>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </form>
</template>

<style scoped>
.conversation-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
  font-size: 0.9rem;
}

textarea {
  font: inherit;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  resize: vertical;
}

.actions {
  display: flex;
  gap: 0.6rem;
}

button {
  align-self: flex-start;
  padding: 0.6rem 1.4rem;
  border-radius: 8px;
  border: none;
  background: var(--accent-color);
  color: white;
  font-weight: 600;
  cursor: pointer;
}

button.secondary {
  background: transparent;
  color: var(--muted-color);
  border: 1px solid var(--border-color);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #c0392b;
  font-size: 0.9rem;
}
</style>
