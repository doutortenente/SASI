import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

// ============================================================================
// Vitest — espelha o alias "@/*" do tsconfig e configura cobertura.
// environment: 'node' porque o motor é puro (sem React/DOM).
// Se for testar componentes React no futuro: troque para 'jsdom' e instale
// jsdom + @testing-library/react -D.
// ============================================================================
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.{test,spec}.ts', 'src/**/index.ts', 'src/**/__tests__/**'],
    },
  },
});
