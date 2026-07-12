<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string;
    label: string;
    type?: 'text' | 'email' | 'tel' | 'number' | 'select';
    options?: { value: string; label: string }[];
    error?: string;
    hint?: string;
    placeholder?: string;
  }>(),
  {
    type: 'text',
    options: () => [],
    error: undefined,
    hint: undefined,
    placeholder: undefined,
  }
);

const model = defineModel<string>();
</script>

<template>
  <div>
    <label :for="id" class="form-label">{{ label }}</label>
    <select v-if="type === 'select'" :id="id" v-model="model" class="form-select" :class="{ 'is-invalid': error }">
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
    <input
      v-else
      :id="id"
      v-model="model"
      :type="type"
      class="form-control"
      :class="{ 'is-invalid': error }"
      :placeholder="placeholder"
    />
    <div v-if="error" class="invalid-feedback">{{ error }}</div>
    <div v-else-if="hint" class="form-text">{{ hint }}</div>
  </div>
</template>
