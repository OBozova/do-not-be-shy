<script setup lang="ts">
import { ref } from "vue";
import { useConversationStore } from "../store/conversationStore.js";

const store = useConversationStore();
const draft = ref("");

function onSubmit(): void {
  const message = draft.value;
  draft.value = "";
  void store.sendFollowUp(message);
}
</script>

<template>
  <section v-if="store.current" class="conversation-thread">
    <h2>Follow up</h2>
    <ul v-if="store.current.messages.length > 0" class="messages">
      <li
        v-for="message in store.current.messages"
        :key="message.id"
        :class="['message', message.role]"
      >
        {{ message.content }}
      </li>
    </ul>
    <p v-else class="empty-state">
      Ask a follow-up — e.g. "explain that joke" or "give me a few more talking points".
    </p>
    <form class="follow-up-form" @submit.prevent="onSubmit">
      <textarea
        v-model="draft"
        rows="2"
        placeholder="Ask a follow-up…"
        :disabled="store.isSendingFollowUp"
      />
      <button type="submit" :disabled="store.isSendingFollowUp || draft.trim().length === 0">
        {{ store.isSendingFollowUp ? "Thinking…" : "Send" }}
      </button>
    </form>
    <p v-if="store.followUpErrorMessage" class="error">{{ store.followUpErrorMessage }}</p>
  </section>
</template>

<style scoped>
.conversation-thread {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

h2 {
  margin: 0;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted-color);
}

.messages {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.message {
  max-width: 80%;
  padding: 0.6rem 0.9rem;
  border-radius: 10px;
  line-height: 1.4;
}

.message.user {
  align-self: flex-end;
  background: var(--accent-color);
  color: white;
}

.message.assistant {
  align-self: flex-start;
  background: var(--card-background);
  border: 1px solid var(--border-color);
}

.follow-up-form {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

textarea {
  flex: 1;
  font: inherit;
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  resize: vertical;
}

button {
  padding: 0.6rem 1.2rem;
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

.empty-state {
  color: var(--muted-color);
  font-style: italic;
}

.error {
  color: #c0392b;
  font-size: 0.9rem;
}
</style>
