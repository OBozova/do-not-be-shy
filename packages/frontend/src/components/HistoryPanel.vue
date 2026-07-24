<script setup lang="ts">
import { onMounted } from "vue";
import { useConversationStore } from "../store/conversationStore.js";

const store = useConversationStore();

onMounted(() => {
  void store.loadHistory();
});
</script>

<template>
  <aside class="history-panel">
    <h2>History</h2>
    <p v-if="store.history.length === 0" class="empty-state">
      Past situations will show up here.
    </p>
    <ul v-else>
      <li
        v-for="entry in store.history"
        :key="entry.id"
        :class="{ active: store.current?.id === entry.id }"
        @click="store.selectHistoryEntry(entry)"
      >
        {{ entry.scenario.description }}
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.history-panel {
  width: 240px;
  flex-shrink: 0;
}

h2 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted-color);
  margin-bottom: 0.75rem;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

li {
  padding: 0.5rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

li:hover {
  background: var(--card-background);
}

li.active {
  background: var(--accent-color);
  color: white;
}

.empty-state {
  color: var(--muted-color);
  font-style: italic;
  font-size: 0.85rem;
}
</style>
