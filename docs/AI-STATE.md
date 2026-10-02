# AI-STATE — estado atual do projeto

Estado resumido entre sessões. **Não é** o mapa do código (`docs/PROJECT_MAP.md`), nem as regras (`CLAUDE.md`), nem o
histórico (`docs/sessoes-claude/`, `docs/bugs-conhecidos/`). Mantenha curto: reescreva, não acumule.

**Última atualização:** 2026-10-02

## Estado atual
- MVP **implementado** (rotas de admin e líder, 10 critérios de aceite cobertos em código). Prazo: 04/10/2026.
- `npm run lint`, `npm run type-check`, `npm test` (17 testes) e `npm run build` passam.
- **Banco Neon ligado**: as 2 migrations (`init` e `reservation_no_overlap`, com `btree_gist` e a constraint de
  exclusão) foram aplicadas e o seed rodou (1 admin, 2 entidades demo, 11 salas, eventos e reservas em vários status).
  O branch usado é o `production` do projeto Neon do Liga UNI: dados de demonstração estão nele.
- Repositório: `https://github.com/gxjosue7/liga-uni` (privado), branch `main`, sem trailer `Co-Authored-By`.
- Credenciais de demonstração: e-mails `admin@liga-uni.test`, `lider1@liga-uni.test`, `lider2@liga-uni.test`; senhas
  só em `.env.local` (nunca em doc).

## Próximos passos (ordem)
1. Vercel: importar o repo e definir `DATABASE_URL` (pooler), `DIRECT_URL` (direta) e `AUTH_SECRET`; o build usa
   `vercel-build` (aplica migrations). `AUTH_URL` é opcional (a Vercel detecta o host).
2. `npm run dev` e percorrer os 10 cenários do briefing em `localhost` (admin e líder). Em especial: conflito de sala
   (a mensagem do erro 23P01 só foi testada por unidade, não contra o Postgres real) e isolamento entre entidades.
3. Revisão visual das telas autenticadas em 375px (só o login foi visto até agora).
4. Rodar a skill `web-design-guidelines` sobre `src/components` e `src/app`.
5. Antes de usar de verdade (não só demo): trocar as senhas do seed e apagar as entidades de demonstração.

## Riscos e dúvidas em aberto
- `isOverlapViolation` reconhece o erro por nome da constraint/SQLSTATE em `message`/`code`/`meta`/`cause`. Se o
  Prisma 7 + adapter-pg embrulhar de outro jeito, a corrida ainda é barrada pelo banco, mas o usuário veria a mensagem
  genérica em vez da de conflito. Conferir no cenário 6.
- O `pg` avisa que `sslmode=require` vira alias de `verify-full`. Funciona hoje; para silenciar, usar `sslmode=verify-full`
  explícito nas connection strings.
- Sem rate limiting no login (força bruta). Fora do MVP, mas é o primeiro item de segurança a adicionar.
- Hierarquia de salas (Rooftop completo x Rooftop 1/2) não existe: são salas independentes.
- Senha de líder só é redefinida pelo admin (sem "esqueci a senha").
