<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue';
</script>

<template>
  <AppLayout>
    <router-view v-slot="{ Component, route }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </AppLayout>
</template>
