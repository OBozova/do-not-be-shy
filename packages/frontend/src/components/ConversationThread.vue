<script setup lang="ts">
import { computed } from "vue";
import type { ConversationMessage } from "shared";
import { useConversationStore } from "../store/conversationStore.js";

const store = useConversationStore();

/**
 * Each follow-up appends a user+assistant pair. Newest pair first, so a new
 * message shows up right under the input and pushes earlier ones down —
 * user/assistant order within a pair stays intact.
 */
const orderedMessages = computed<ConversationMessage[]>(() => {
  const messages = store.current?.messages ?? [];
  const pairs: ConversationMessage[][] = [];
  for (let i = 0; i < messages.length; i += 2) {
    pairs.push(messages.slice(i, i + 2));
  }
  return pairs.reverse().flat();
});
</script>

<template>
  <section v-if="store.current" class="conversation-thread">
    <h2>Follow up</h2>
    <ul v-if="orderedMessages.length > 0" class="messages">
      <li
        v-for="message in orderedMessages"
        :key="message.id"
        :class="['message', message.role]"
      >
        {{ message.content }}
      </li>
    </ul>
    <p v-else class="empty-state">
      Ask a follow-up above — e.g. "explain that joke" or "give me a few more talking points".
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
