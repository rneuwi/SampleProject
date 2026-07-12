<script setup lang="ts">
import { ref } from 'vue';

const isOpen = ref(false);

function closeMenu(): void {
  isOpen.value = false;
}
</script>

<template>
  <nav class="navbar navbar-expand-md navbar-dark bg-primary">
    <div class="container">
      <RouterLink class="navbar-brand" to="/" @click="closeMenu">
        <i class="bi bi-bank2 me-2"></i>Mortgage Prequal Dashboard
      </RouterLink>
      <button
        class="navbar-toggler"
        type="button"
        :aria-expanded="isOpen"
        aria-label="Toggle navigation"
        @click="isOpen = !isOpen"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="navbar-collapse" :class="{ collapse: !isOpen }">
        <div class="navbar-nav ms-auto">
          <RouterLink class="nav-link" to="/" active-class="active" @click="closeMenu">Dashboard</RouterLink>
          <RouterLink class="nav-link" to="/applications/new" active-class="active" @click="closeMenu"
            >New Application</RouterLink
          >
        </div>
      </div>
    </div>
  </nav>
</template>
