<script setup lang="ts">
import { maskCurrency, maskPercent, maskPhone } from '@/utils/masks';

const props = withDefaults(
  defineProps<{
    id: string;
    label: string;
    // Deliberately no 'number' here: Vue's v-model auto-casts <input type="number">
    // to an actual JS Number (even without the .number modifier), which breaks the
    // "numeric fields stay strings, the API coerces them" contract this form relies
    // on. Use type="text" + inputmode="decimal"/"numeric" for numeric-looking fields
    // instead — same mobile keyboard, no silent type coercion.
    type?: 'text' | 'email' | 'tel' | 'select';
    inputmode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'email';
    mask?: 'phone' | 'currency' | 'percent';
    options?: { value: string; label: string }[];
    error?: string;
    hint?: string;
    placeholder?: string;
    required?: boolean;
    min?: number | string;
    max?: number | string;
  }>(),
  {
    type: 'text',
    inputmode: undefined,
    mask: undefined,
    options: () => [],
    error: undefined,
    hint: undefined,
    placeholder: undefined,
    required: false,
    min: undefined,
    max: undefined,
  }
);

const model = defineModel<string>();

const maskFns = { phone: maskPhone, currency: maskCurrency, percent: maskPercent } as const;

function onInput(event: Event): void {
  const raw = (event.target as HTMLInputElement).value;
  model.value = props.mask ? maskFns[props.mask](raw) : raw;
}
</script>

<template>
  <div>
    <label :for="id" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger" aria-hidden="true">*</span>
    </label>
    <select
      v-if="type === 'select'"
      :id="id"
      v-model="model"
      class="form-select"
      :class="{ 'is-invalid': error }"
      :required="required"
      :aria-required="required"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
    <input
      v-else
      :id="id"
      :value="model"
      @input="onInput"
      :type="type"
      :inputmode="inputmode"
      class="form-control"
      :class="{ 'is-invalid': error }"
      :placeholder="placeholder"
      :required="required"
      :aria-required="required"
      :min="min"
      :max="max"
    />
    <div v-if="error" class="invalid-feedback">{{ error }}</div>
    <div v-else-if="hint" class="form-text">{{ hint }}</div>
  </div>
</template>
