<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    label: string;
    value: number;
    maxValue?: number;
    goodThreshold: number;
    warnThreshold: number;
  }>(),
  { maxValue: 100 }
);

const percentOfScale = computed(() => Math.min(100, Math.max(0, (props.value / props.maxValue) * 100)));

const variant = computed(() => {
  if (props.value <= props.goodThreshold) return 'success';
  if (props.value <= props.warnThreshold) return 'warning';
  return 'danger';
});
</script>

<template>
  <div>
    <div class="d-flex justify-content-between small mb-1">
      <span class="text-muted">{{ label }}</span>
      <span class="fw-semibold">{{ value.toFixed(2) }}%</span>
    </div>
    <div class="progress" role="progressbar" :aria-valuenow="value" aria-valuemin="0" :aria-valuemax="maxValue">
      <div class="progress-bar" :class="`bg-${variant}`" :style="{ width: `${percentOfScale}%` }"></div>
    </div>
  </div>
</template>
