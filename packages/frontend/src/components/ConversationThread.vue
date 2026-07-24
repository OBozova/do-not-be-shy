<script setup lang="ts">
import { useConversationStore } from "../store/conversationStore.js";

const store = useConversationStore();
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
      Ask a follow-up below — e.g. "explain that joke" or "give me a few more talking points".
    </p>
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

.empty-state {
  color: var(--muted-color);
  font-style: italic;
}
</style>
