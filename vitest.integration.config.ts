import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

// Testes de integração: falam com o banco real (DATABASE_URL do .env.local) e
// criam/removem dados com prefixo próprio. Rodam à parte (`npm run test:integration`),
// nunca junto do `npm test`.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    setupFiles: ['./tests/integration/setup.ts'],
    fileParallelism: false,
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'server-only': fileURLToPath(new URL('./node_modules/server-only/empty.js', import.meta.url)),
    },
  },
})
