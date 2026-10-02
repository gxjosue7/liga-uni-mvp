import 'dotenv/config'
import { config as loadEnvLocal } from 'dotenv'
import { defineConfig } from 'prisma/config'

loadEnvLocal({ path: '.env.local', override: true })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env['DIRECT_URL'] ?? process.env['DATABASE_URL'],
  },
})
