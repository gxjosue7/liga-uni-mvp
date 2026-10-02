# MVP da Liga UNI: do zero ao build

**Data:** 2026-10-02

## Resumo
Pesquisa sobre o Ágora Tech Park e o Ágora UNI, depois construção do MVP do Liga UNI num repositório vazio
(`agora-uni-mvp`): login por perfil, entidades e líderes, membros com curso, calendário com eventos e reservas, salas e
fila de aprovação. Lint, tipos, testes e build passam; o fluxo contra o banco ainda não foi exercitado porque o Neon
não foi ligado nesta sessão.

## Mudanças de negócio
Sistema novo. Admin (equipe do Ágora) cria entidades e líderes, administra salas e aprova/recusa reservas; líder
cadastra membros e eventos da própria entidade e solicita salas. Conflito de horário na mesma sala é barrado.

## Mudanças técnicas
- Next 16 + Prisma 7/Neon + Auth.js v5 (JWT, sem adapter), seguindo a stack do Nascimento Barbearia e, a pedido do dono,
  as regras de código/mobile-first dela (`CLAUDE.md` próprio, sem Sentry/Turnstile/Resend).
- Camadas: Server Actions finas (`src/actions`) → serviços com `Actor` explícito (`src/server`) → infra (`src/lib`).
  O líder nunca informa `entityId`; ele vem do ator e entra no `where`.
- Conflito de sala em duas camadas: checagem na aplicação e `EXCLUDE USING gist` no Postgres (migration SQL, motivo
  documentado no arquivo). Só PENDING/APPROVED bloqueiam.
- `proxy.ts` é só redirecionamento; a segurança está em layouts, ações e serviços.
- Visual: amarelo do Ágora + preto + branco, Archivo variável, geometria angular, calendário em lista de links (sem
  `role="grid"` falso), `<dialog>` nativo, barra inferior no celular.
- Bug achado por teste: `new Date('2026-02-31…')` não falha no V8 (ver `docs/bugs-conhecidos/`).

## Arquivos alterados
Projeto novo, tudo em `agora-uni-mvp/`: `prisma/` (schema, 2 migrations, seed), `src/{actions,server,lib,components,app,config,types}`,
`docs/`, `CLAUDE.md`, configs (Next, Tailwind, ESLint, Vitest, Prisma).

## Banco de dados
Migrations criadas (`init`, `reservation_no_overlap`) e seed escrito; **nada aplicado ainda**.

## Pendências / próximos passos
Ver `docs/AI-STATE.md` (ligar o Neon, migrar, semear e percorrer os 10 cenários em `localhost`).
