# AI-STATE — estado atual do projeto

Estado resumido entre sessões. **Não é** o mapa do código (`docs/PROJECT_MAP.md`), nem as regras (`CLAUDE.md`), nem o
histórico (`docs/sessoes-claude/`, `docs/bugs-conhecidos/`). Mantenha curto: reescreva, não acumule.

**Última atualização:** 2026-10-02

## Estado atual
- MVP **implementado** (todas as rotas de admin e líder, 10 critérios de aceite cobertos em código). Prazo: 04/10/2026.
- `npm run lint`, `npm run type-check`, `npm test` (17 testes) e `npm run build` passam.
- **Nunca rodou contra um banco.** O projeto Neon (`misty-mouse-85734095`, branch `production`) ainda não está ligado:
  faltam `DATABASE_URL`/`DIRECT_URL` em `.env.local`. Sem isso, só `/login` abre. A criação do `.env.local` (com
  `AUTH_SECRET` e senhas do seed já gerados) foi feita; o CLI da Neon **não foi instalado** (bloqueado na sessão).
- Repositório local sem `git init` e sem GitHub (a pedido: ainda não subiu).

## Próximos passos (ordem)
1. Colocar `DATABASE_URL` e `DIRECT_URL` (Neon) em `.env.local`.
2. `npm run db:migrate` (aplica `init` + `reservation_no_overlap`), depois `npm run db:seed`.
3. `npm run dev` e percorrer os 10 cenários do briefing em `localhost` (admin e líder). Em especial: conflito de sala
   (a mensagem do erro 23P01 só foi testada por unidade, não contra o Postgres real) e isolamento entre entidades.
4. Revisão visual das telas autenticadas em 375px (só o login foi visto até agora).
5. Rodar a skill `web-design-guidelines` sobre `src/components` e `src/app`.
6. `git init`, primeiro commit, repositório no GitHub, projeto na Vercel (`vercel-build` aplica as migrations).

## Riscos e dúvidas em aberto
- A constraint `reservation_no_overlap` usa `btree_gist`; o Neon suporta, mas não foi aplicada ainda.
- `isOverlapViolation` reconhece o erro por nome da constraint/SQLSTATE em `message`/`code`/`meta`/`cause`. Se o
  Prisma 7 + adapter-pg embrulhar de outro jeito, a corrida ainda é barrada pelo banco, mas o usuário veria a mensagem
  genérica em vez da de conflito. Conferir no cenário 6.
- Sem rate limiting no login (força bruta). Fora do MVP, mas é o primeiro item de segurança a adicionar.
- Hierarquia de salas (Rooftop completo x Rooftop 1/2) não existe: são salas independentes.
- Senha de líder só é redefinida pelo admin (sem "esqueci a senha").
