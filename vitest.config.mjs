import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    pool: 'vmThreads',
    globals: true,
    include: ['__tests__/**/*.test.{js,jsx}'],
  },
});
