<script setup lang="ts">
import { computed } from 'vue';
import type { UnderwritingStatus } from '@/types/domain';

const props = defineProps<{ status: UnderwritingStatus }>();

const STATUS_CONFIG: Record<UnderwritingStatus, { label: string; badgeClass: string; icon: string }> = {
  approved: { label: 'Approved', badgeClass: 'text-bg-success', icon: 'bi-check-circle-fill' },
  conditional: { label: 'Conditional', badgeClass: 'text-bg-warning', icon: 'bi-exclamation-circle-fill' },
  refer: { label: 'Refer', badgeClass: 'text-bg-info', icon: 'bi-question-circle-fill' },
  declined: { label: 'Declined', badgeClass: 'text-bg-danger', icon: 'bi-x-circle-fill' },
};

const current = computed(() => STATUS_CONFIG[props.status]);
</script>

<template>
  <span class="badge rounded-pill d-inline-flex align-items-center gap-1" :class="current.badgeClass">
    <i class="bi" :class="current.icon" aria-hidden="true"></i>
    {{ current.label }}
  </span>
</template>
