import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  root: './',
  // No GitHub Pages o site vive em /MoonSrc/, então os assets precisam desse
  // prefixo. Em desenvolvimento fica na raiz para o servidor local seguir simples.
  base: command === 'build' ? '/MoonSrc/' : '/',
  server: {
    port: 3000,
    open: false
  },
  test: {
    globals: true,
    environment: 'node'
  }
}));
