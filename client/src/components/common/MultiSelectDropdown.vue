<script setup lang="ts" generic="T extends string">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps<{
  modelValue: T[];
  options: { value: T; label: string }[];
  placeholder: string;
}>();

const emit = defineEmits<{ 'update:modelValue': [T[]] }>();

// Bootstrap's own dropdown JS isn't loaded in this app (see Modal.vue's notes on
// why) — only its CSS classes (.dropdown, .dropdown-menu, .show) are borrowed here,
// with open/close and selection driven entirely by this component's own state so
// checking an option doesn't auto-close the menu the way Bootstrap's JS would.
const isOpen = ref(false);
const root = ref<HTMLElement | null>(null);

const summary = computed(() => {
  const selected = props.options.filter((option) => props.modelValue.includes(option.value));
  if (selected.length === 0) return props.placeholder;
  if (selected.length <= 2) return selected.map((option) => option.label).join(', ');
  return `${selected.length} selected`;
});

function toggleOpen(): void {
  isOpen.value = !isOpen.value;
}

function toggleOption(value: T): void {
  const next = props.modelValue.includes(value)
    ? props.modelValue.filter((v) => v !== value)
    : [...props.modelValue, value];
  emit('update:modelValue', next);
}

function onDocumentClick(event: MouseEvent): void {
  if (root.value && !root.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick));
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick));
</script>

<template>
  <div ref="root" class="dropdown" @keydown.escape="isOpen = false">
    <button
      type="button"
      class="form-select form-select-sm text-start"
      aria-haspopup="true"
      :aria-expanded="isOpen"
      @click="toggleOpen"
    >
      {{ summary }}
    </button>
    <ul class="dropdown-menu p-2" :class="{ show: isOpen }">
      <li v-for="option in options" :key="option.value">
        <label class="dropdown-item form-check mb-0 d-flex align-items-center gap-2">
          <input
            class="form-check-input mt-0"
            type="checkbox"
            :checked="modelValue.includes(option.value)"
            @change="toggleOption(option.value)"
          />
          {{ option.label }}
        </label>
      </li>
    </ul>
  </div>
</template>
