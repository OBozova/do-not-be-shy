<script setup lang="ts">
import ConversationInput from "./components/ConversationInput.vue";
import ConversationThread from "./components/ConversationThread.vue";
import SuggestionBoard from "./components/SuggestionBoard.vue";
import HistoryPanel from "./components/HistoryPanel.vue";
import { useConversationStore } from "./store/conversationStore.js";

const store = useConversationStore();
</script>

<template>
  <div class="app-layout">
    <aside
      v-if="store.current"
      class="suggestions-panel"
    >
      <div class="sticky-note">
        <span class="sticky-label">You asked</span>
        <p>{{ store.current.scenario.description }}</p>
      </div>
      <SuggestionBoard />
    </aside>
    <main>
      <header>
        <h1>Do Not Be Shy</h1>
        <p class="tagline">
          Conversation prep for whatever's next.
        </p>
      </header>
      <ConversationInput />
      <ConversationThread />
    </main>
    <HistoryPanel />
  </div>
</template>

<style scoped>
.app-layout {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
}

header h1 {
  margin: 0;
  font-size: 1.6rem;
}

.tagline {
  margin: 0.25rem 0 0;
  color: var(--muted-color);
}

.suggestions-panel {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.suggestions-panel :deep(.suggestion-board) {
  grid-template-columns: 1fr;
}

.sticky-note {
  background: #fff3a3;
  color: #423c1d;
  padding: 1rem 1.1rem;
  border-radius: 4px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18);
  transform: rotate(-2deg);
}

.sticky-note p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.4;
  overflow-wrap: break-word;
}

.sticky-label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.65;
  margin-bottom: 0.4rem;
}
</style>
