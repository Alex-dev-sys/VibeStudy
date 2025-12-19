import { defineConfig } from 'vitest/config';
import path from 'path';

// Resolve paths relative to project root (two levels up from config/tools/)
const projectRoot = path.resolve(__dirname, '../..');

export default defineConfig({
  root: projectRoot,
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, 'src')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
    setupFiles: ['tests/setup.ts'],
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
});

