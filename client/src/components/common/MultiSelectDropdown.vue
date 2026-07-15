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
      class="form-select form-select-sm text-start text-nowrap text-truncate status-filter-button"
      aria-haspopup="true"
      :aria-expanded="isOpen"
      :title="summary"
      @click="toggleOpen"
    >
      {{ summary }}
    </button>
    <ul class="dropdown-menu p-2" :class="{ show: isOpen }">
      <li v-for="option in options" :key="option.value">
        <button
          type="button"
          class="dropdown-item"
          :class="{ 'option-selected': modelValue.includes(option.value) }"
          :aria-pressed="modelValue.includes(option.value)"
          @click="toggleOption(option.value)"
        >
          {{ option.label }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* Fixed rather than content-sized (w-auto) so the button — and the menu
   anchored to it — don't shift position each time the summary text changes
   length as options are selected/deselected. Sized to fit the longest
   realistic summary ("Conditional, Declined") without wrapping. */
.status-filter-button {
  width: 13rem;
}

/* Bootstrap's reboot sets `button:focus:not(:focus-visible) { outline: 0; }`,
   which outranks a plain .option-selected class on specificity, so a mouse
   click would otherwise clear the outline on the very item it selects. */
button.option-selected {
  outline: 1px solid var(--bs-primary) !important;
  outline-offset: -1px;
  border-radius: 0.25rem;
}
</style>
