<script setup lang="ts">
import ConversationInput from "./components/ConversationInput.vue";
import ConversationThread from "./components/ConversationThread.vue";
import SuggestionBoard from "./components/SuggestionBoard.vue";
import HistoryPanel from "./components/HistoryPanel.vue";
</script>

<template>
  <div class="app-layout">
    <main>
      <header>
        <h1>Do Not Be Shy</h1>
        <p class="tagline">
          Conversation prep for whatever's next.
        </p>
      </header>
      <ConversationInput />
      <ConversationThread />
      <SuggestionBoard />
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
</style>
