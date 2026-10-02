import { config } from 'dotenv'

config({ path: '.env.local', override: true })

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL ausente: preencha o .env.local antes de rodar os testes de integração.')
}
