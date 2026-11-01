import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ant-design/icons': '@ant-design/icons/es',
    },
  },
  test: {
    environment: 'jsdom',
    pool: 'forks',
    isolate: false,
    testTimeout: 20000,
    globals: true,
    include: ['__tests__/**/*.test.{js,jsx}'],
    server: {
      deps: {
        inline: ['antd', '@ant-design/icons', '@ant-design/colors'],
      },
    },
  },
});
