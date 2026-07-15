<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    value: string | number;
    icon?: string;
    variant?: 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'secondary';
    clickable?: boolean;
    active?: boolean;
  }>(),
  { icon: undefined, variant: 'primary', clickable: false, active: false }
);

const emit = defineEmits<{ click: [] }>();
</script>

<template>
  <div
    class="card h-100"
    :class="{ 'clickable-stat': clickable, 'border-primary': active }"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    @click="clickable && emit('click')"
    @keydown.enter="clickable && emit('click')"
    @keydown.space.prevent="clickable && emit('click')"
  >
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

.clickable-stat {
  cursor: pointer;
}

.clickable-stat:focus-visible {
  outline: 2px solid var(--bs-primary);
  outline-offset: 2px;
}
</style>
