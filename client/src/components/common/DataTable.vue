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
          <th
            v-for="column in columns"
            :key="column.key"
            :class="[alignClass(column.align), column.sortable ? 'sortable' : '']"
            @click="column.sortable && emit('sort', column.key)"
          >
            {{ column.label }}
            <span v-if="column.sortable && sortBy === column.key" class="text-primary">
              {{ sortDir === 'asc' ? '▲' : '▼' }}
            </span>
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
        <tr v-for="row in rows" v-else :key="String(row[rowKey])" class="clickable-row" @click="emit('rowClick', row)">
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
.sortable {
  cursor: pointer;
  user-select: none;
}

.clickable-row {
  cursor: pointer;
}
</style>
