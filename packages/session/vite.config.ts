import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/lib/**/*.{test,spec}.{js,ts}'],
    globals: true,
    setupFiles: ['./test/global-setup.ts'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/lib/**/*.{js,ts}'],
      exclude: [
        '**/session/utils.ts',
        '**/session/handler.ts',
        '**/types/**',
        '**/hooks.server.ts',
        '**/index.ts',
        '**/constants/**',
        '**/icons/**',
        '**/*.d.ts',
        '**/*.spec.{js,ts}'
      ],
      reportsDirectory: './.coverage'
    }
  }
});
