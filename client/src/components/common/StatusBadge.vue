<script setup lang="ts">
import { computed } from 'vue';
import type { UnderwritingStatus } from '@/types/domain';

const props = defineProps<{ status: UnderwritingStatus }>();

const STATUS_CONFIG: Record<UnderwritingStatus, { label: string; badgeClass: string }> = {
  approved: { label: 'Approved', badgeClass: 'text-bg-success' },
  conditional: { label: 'Conditional', badgeClass: 'text-bg-warning' },
  refer: { label: 'Refer', badgeClass: 'text-bg-info' },
  declined: { label: 'Declined', badgeClass: 'text-bg-danger' },
};

const current = computed(() => STATUS_CONFIG[props.status]);
</script>

<template>
  <span class="badge rounded-pill" :class="current.badgeClass">{{ current.label }}</span>
</template>
