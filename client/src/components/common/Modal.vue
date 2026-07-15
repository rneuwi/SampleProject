<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    size?: 'sm' | 'lg' | 'xl';
  }>(),
  { title: undefined, size: undefined }
);

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const titleId = useId();
const dialogRef = ref<HTMLElement | null>(null);

function close(): void {
  emit('update:modelValue', false);
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.modelValue) close();
}

onMounted(() => document.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown));

watch(
  () => props.modelValue,
  async (isOpen) => {
    document.body.classList.toggle('overflow-hidden', isOpen);
    if (isOpen) {
      await nextTick();
      dialogRef.value?.focus();
    }
  }
);
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-backdrop-custom" @click.self="close">
      <div
        ref="dialogRef"
        class="modal-dialog-custom"
        :class="size ? `modal-${size}` : ''"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 :id="titleId" class="modal-title">{{ title }}</h5>
            <button type="button" class="btn-close" aria-label="Close" @click="close"></button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<!--
  Built on Bootstrap's modal CSS classes (.modal-content, .modal-header, ...)
  but driven entirely by Vue state via Teleport, rather than Bootstrap's own
  JS/Popper modal component — mixing Bootstrap's imperative DOM toggling with
  Vue's reactivity is a common source of subtle bugs.

  One gotcha this caused: Bootstrap 5.3's .modal-content only gets its colors
  from --bs-modal-bg/-color/-border-* custom properties, and those are only
  *defined* on Bootstrap's own .modal wrapper class, which we don't use. Left
  alone, .modal-content renders with a fully transparent background. Fixed by
  backfilling the same variables here from Bootstrap's globally-available
  root variables (--bs-body-bg etc.), so it still tracks the active theme.
  Same story for spacing: .modal-header/-body/-footer padding is driven by
  --bs-modal-padding/-header-padding/-footer-gap, also only defined on
  .modal, so without backfilling them here the header/body/footer render
  with zero padding and content (e.g. footer buttons) touches the edges.
-->
<style scoped>
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1055;
  padding: 1rem;
  --bs-modal-bg: var(--bs-body-bg);
  --bs-modal-color: var(--bs-body-color);
  --bs-modal-border-color: var(--bs-border-color-translucent);
  --bs-modal-border-width: var(--bs-border-width);
  --bs-modal-border-radius: var(--bs-border-radius-lg);
  --bs-modal-header-border-color: var(--bs-border-color);
  --bs-modal-footer-border-color: var(--bs-border-color);
  --bs-modal-padding: 1rem;
  --bs-modal-header-padding: 1rem 1rem;
  --bs-modal-footer-gap: 0.5rem;
}

.modal-dialog-custom {
  width: 100%;
  max-width: 500px;
  outline: none;
}

.modal-dialog-custom.modal-sm {
  max-width: 300px;
}

.modal-dialog-custom.modal-lg {
  max-width: 800px;
}

.modal-dialog-custom.modal-xl {
  max-width: 1140px;
}
</style>
