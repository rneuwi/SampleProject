<script setup lang="ts" generic="T extends Record<string, unknown>">
import type { DataTableColumn } from '@/types/dataTable';

defineProps<{
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: keyof T & string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  loading?: boolean;
  emptyMessage?: string;
}>();

const emit = defineEmits<{
  sort: [key: string];
  rowClick: [row: T];
}>();

defineSlots<{
  [slot: `cell-${string}`]: (props: { row: T; value: unknown }) => unknown;
}>();

function alignClass(align?: 'start' | 'center' | 'end'): string {
  return align ? `text-${align}` : '';
}
</script>

<template>
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" scope="col" :class="alignClass(column.align)">
            <button
              v-if="column.sortable"
              type="button"
              class="btn btn-link p-0 fw-semibold text-reset text-decoration-none sort-header"
              @click="emit('sort', column.key)"
            >
              {{ column.label }}
              <span v-if="sortBy === column.key" class="text-primary">
                {{ sortDir === 'asc' ? '▲' : '▼' }}
              </span>
            </button>
            <template v-else>{{ column.label }}</template>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length" class="text-center text-muted py-4">Loading…</td>
        </tr>
        <tr v-else-if="rows.length === 0">
          <td :colspan="columns.length" class="text-center text-muted py-4">
            {{ emptyMessage ?? 'No records found.' }}
          </td>
        </tr>
        <tr
          v-for="row in rows"
          v-else
          :key="String(row[rowKey])"
          class="clickable-row"
          role="button"
          tabindex="0"
          @click="emit('rowClick', row)"
          @keydown.enter="emit('rowClick', row)"
        >
          <td v-for="column in columns" :key="column.key" :class="alignClass(column.align)">
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.sort-header {
  cursor: pointer;
  user-select: none;
}

.clickable-row {
  cursor: pointer;
}

.clickable-row:focus-visible {
  outline: 2px solid var(--bs-primary);
  outline-offset: -2px;
}
</style>
