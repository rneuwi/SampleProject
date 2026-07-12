<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    value: string | number;
    icon?: string;
    variant?: 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'secondary';
  }>(),
  { icon: undefined, variant: 'primary' }
);
</script>

<template>
  <div class="card h-100">
    <div class="card-body d-flex align-items-center gap-3">
      <div
        v-if="icon"
        class="stat-icon rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
        :class="[`bg-${variant}-subtle`, `text-${variant}`]"
      >
        <i :class="icon"></i>
      </div>
      <div>
        <div class="text-muted small">{{ label }}</div>
        <div class="fs-4 fw-semibold">{{ value }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-icon {
  width: 3rem;
  height: 3rem;
  font-size: 1.25rem;
}
</style>
