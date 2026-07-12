<script setup lang="ts">
import AppHeader from './AppHeader.vue';
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <AppHeader />
    <main class="flex-grow-1 container py-4">
      <slot />
    </main>
  </div>
</template>
