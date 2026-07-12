<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}>();

const emit = defineEmits<{ 'update:page': [page: number] }>();

function goTo(page: number): void {
  if (page < 1 || page > props.totalPages || page === props.page) return;
  emit('update:page', page);
}

const rangeStart = computed(() => (props.totalItems === 0 ? 0 : (props.page - 1) * props.pageSize + 1));
const rangeEnd = computed(() => Math.min(props.page * props.pageSize, props.totalItems));

const pageNumbers = computed(() => {
  const windowSize = 5;
  let start = Math.max(1, props.page - Math.floor(windowSize / 2));
  const end = Math.min(props.totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});
</script>

<template>
  <nav class="d-flex justify-content-between align-items-center flex-wrap gap-2" aria-label="Pagination">
    <span class="text-muted small">Showing {{ rangeStart }}–{{ rangeEnd }} of {{ totalItems }}</span>
    <ul class="pagination mb-0">
      <li class="page-item" :class="{ disabled: page === 1 }">
        <button class="page-link" type="button" @click="goTo(page - 1)">Previous</button>
      </li>
      <li v-for="pageNumber in pageNumbers" :key="pageNumber" class="page-item" :class="{ active: pageNumber === page }">
        <button class="page-link" type="button" @click="goTo(pageNumber)">{{ pageNumber }}</button>
      </li>
      <li class="page-item" :class="{ disabled: page === totalPages }">
        <button class="page-link" type="button" @click="goTo(page + 1)">Next</button>
      </li>
    </ul>
  </nav>
</template>
