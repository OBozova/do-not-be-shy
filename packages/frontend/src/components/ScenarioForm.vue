<script setup lang="ts">
import { useConversationStore } from "../store/conversationStore.js";

const store = useConversationStore();

function onSubmit(): void {
  void store.generateSuggestions();
}
</script>

<template>
  <form class="scenario-form" @submit.prevent="onSubmit">
    <label for="description">Describe the situation you're walking into</label>
    <textarea
      id="description"
      v-model="store.description"
      rows="4"
      placeholder="e.g. Job interview with two people at an AI startup, technical challenge round, casual atmosphere"
    />
    <button type="submit" :disabled="store.isLoading || store.description.trim().length === 0">
      {{ store.isLoading ? "Thinking…" : "Get suggestions" }}
    </button>
    <p v-if="store.errorMessage" class="error">{{ store.errorMessage }}</p>
  </form>
</template>

<style scoped>
.scenario-form {
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

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #c0392b;
  font-size: 0.9rem;
}
</style>
