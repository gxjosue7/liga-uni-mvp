# Liga UNI

Ferramenta interna do Ágora UNI (Ágora Tech Park, Joinville/SC) para gerir a relação contínua com entidades
acadêmicas: entidades e líderes, membros, calendário e reservas de salas. Não confundir com o programa Liga Ágora.

Stack: Next.js 16 · React 19 · TypeScript · Tailwind 3 · Prisma 7 + PostgreSQL (Neon) · Auth.js v5 · Zod · date-fns.

## Rodar localmente

```bash
npm install
cp .env.example .env.local     # preencha os valores (veja abaixo)
npm run db:migrate             # aplica as migrations no banco
npm run db:seed                # admin, 2 entidades demo, salas, eventos e reservas
npm run dev                    # http://localhost:3000
```

## Variáveis de ambiente (`.env.local`)

| Variável | Para quê |
|---|---|
| `DATABASE_URL` | Connection string do Neon (com pooler), usada pelo app |
| `DIRECT_URL` | Connection string direta do Neon, usada pelo Prisma CLI (migrate/seed) |
| `AUTH_SECRET` | Segredo do Auth.js (`npx auth secret`) |
| `AUTH_URL` | **Não defina.** O app usa o host da requisição; um valor `localhost` na Vercel quebra redirecionamentos |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | Conta admin criada pelo seed |
| `LEADER1_EMAIL/PASSWORD`, `LEADER2_EMAIL/PASSWORD` | Líderes das 2 entidades demo |

Nenhuma senha fica no código. `.env*` não vai para o Git (só `.env.example`).

## Scripts

`dev` · `build` (generate + next build, sem tocar no banco) · `vercel-build` (migrate deploy + build, usado na Vercel) ·
`lint` · `type-check` · `test` · `db:migrate` · `db:seed` · `db:studio`.

## Deploy (Vercel + Neon)

Defina `DATABASE_URL`, `DIRECT_URL` e `AUTH_SECRET` na Vercel. O build usa `vercel-build`, que aplica as migrations
antes de compilar. Rode o seed uma vez apontando para o banco desejado.

## Documentação

`CLAUDE.md` (regras) · `docs/PROJECT_MAP.md` (mapa do código) · `docs/AI-STATE.md` (estado e pendências).
