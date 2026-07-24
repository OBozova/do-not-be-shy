<script setup lang="ts">
import { computed } from "vue";
import { SUGGESTION_CATEGORIES, SUGGESTION_CATEGORY_LABELS } from "shared";
import { useConversationStore } from "../store/conversationStore.js";
import SuggestionCard from "./SuggestionCard.vue";

const store = useConversationStore();

const cards = computed(() => {
  const current = store.current;
  if (!current) return [];
  return SUGGESTION_CATEGORIES.map((category) => ({
    category,
    title: SUGGESTION_CATEGORY_LABELS[category],
    items: current.suggestions[category],
  }));
});
</script>

<template>
  <div v-if="store.isLoading" class="empty-state">Coaching in progress…</div>
  <div v-else-if="cards.length > 0" class="suggestion-board">
    <SuggestionCard
      v-for="card in cards"
      :key="card.category"
      :title="card.title"
      :items="card.items"
    />
  </div>
  <p v-else class="empty-state">Describe a situation above to get conversation-ready.</p>
</template>

<style scoped>
.suggestion-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.empty-state {
  color: var(--muted-color);
  font-style: italic;
}
</style>
