import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  server: {
    port: 3000,
    open: false
  },
  test: {
    globals: true,
    environment: 'node'
  }
});
