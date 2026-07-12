import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap 5.3's own SCSS source still uses Dart Sass APIs (legacy
        // color functions, @import) that newer Dart Sass deprecates. These
        // warnings originate from bootstrap/scss/*, not this project's code.
        silenceDeprecations: ['color-functions', 'import', 'global-builtin', 'if-function'],
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    // Docker Desktop's bind mounts don't reliably forward native fs change
    // events on Windows/macOS, so hot reload needs polling to work at all.
    watch: {
      usePolling: true,
      interval: 300,
    },
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET ?? 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
