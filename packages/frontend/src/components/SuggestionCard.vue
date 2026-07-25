<script setup lang="ts">
defineProps<{
  title: string;
  items: string[];
}>();
</script>

<template>
  <div class="suggestion-card">
    <h3>{{ title }}</h3>
    <ul>
      <li
        v-for="item in items"
        :key="item"
      >
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.suggestion-card {
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  background: var(--card-background);
}

h3 {
  margin: 0 0 0.6rem;
  font-size: 1rem;
  color: var(--accent-color);
}

ul {
  margin: 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

li {
  line-height: 1.4;
}
</style>
