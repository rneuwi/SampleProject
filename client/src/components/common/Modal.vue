<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    size?: 'sm' | 'lg' | 'xl';
  }>(),
  { title: undefined, size: undefined }
);

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

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
  (isOpen) => document.body.classList.toggle('overflow-hidden', isOpen)
);
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-backdrop-custom" @click.self="close">
      <div class="modal-dialog-custom" :class="size ? `modal-${size}` : ''">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ title }}</h5>
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
}

.modal-dialog-custom {
  width: 100%;
  max-width: 500px;
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
