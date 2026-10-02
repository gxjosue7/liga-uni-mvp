# AI-STATE — estado atual do projeto

Estado resumido entre sessões. **Não é** o mapa do código (`docs/PROJECT_MAP.md`), nem as regras (`CLAUDE.md`), nem o
histórico (`docs/sessoes-claude/`, `docs/bugs-conhecidos/`). Mantenha curto: reescreva, não acumule.

> Este repositório é **público**. Nada aqui pode conter credenciais, IDs/hosts de infraestrutura, e-mails de contas
> ou vulnerabilidades descritas de forma explorável (regra completa no `CLAUDE.md`).

**Última atualização:** 2026-10-02

## Estado atual
- MVP **implementado** (rotas de admin e líder, 10 critérios de aceite cobertos em código). Prazo: 04/10/2026.
- `npm run lint`, `npm run type-check`, `npm test` (17 testes) e `npm run build` passam.
- Banco (Neon) com as 2 migrations aplicadas e o seed rodado: há **dados de demonstração** no banco. As credenciais
  de demonstração vivem só no `.env.local` (nunca neste repositório).
- Repositório público no GitHub, branch `main`, conectado à Vercel.
- Favicon: `src/app/icon.png`, `apple-icon.png` e `favicon.ico`, gerados do logo em `fotos/`.

## Verificado (2026-10-02)
- `npm run test:integration` (25 testes, banco real): isolamento entre entidades, calendário por perfil, conflito de
  sala (inclusive a constraint do Postgres e a corrida entre 2 requisições), aprovar/recusar/cancelar, sala desativada.
- Ponta a ponta por HTTP (37 checagens): login real, redirecionamento por perfil, todas as rotas de admin e líder
  respondendo com dados reais, líder sem acesso a `/admin`, logout.
- Bug achado e corrigido: loop de redirecionamento para usuário desativado com sessão antiga.

## Próximos passos (ordem)
1. Clicar nos diálogos e formulários no navegador (criar membro, evento, solicitar sala, aprovar/recusar): as regras
   estão testadas na camada de serviço, mas o comportamento de `ActionForm`/`Dialog`/toast no navegador ainda não.
2. Revisão visual das telas autenticadas em 375px (só o login foi visto até agora).
3. Rodar a skill `web-design-guidelines` sobre `src/components` e `src/app`.
4. Antes do uso real: trocar as senhas do seed e apagar as entidades de demonstração.
5. Pós-MVP: limite de tentativas de login e fluxo de redefinição de senha.

## Pontos de atenção
- Não definir `AUTH_URL` na Vercel: um valor `localhost` mandava o logout de produção para lá. O logout agora usa
  redirect relativo, mas a variável errada ainda pode afetar outras URLs do Auth.js.
- Deploy novo logo depois de abrir uma página pode dar erro de Server Action "não encontrada" até recarregar
  (página de um deploy anterior). O formulário já mostra mensagem amigável; `src/app/error.tsx` cobre o resto.
- `isOverlapViolation` reconhece o erro do banco por nome da constraint/SQLSTATE. Se o formato mudar, a corrida ainda é
  barrada pelo banco, mas o usuário veria a mensagem genérica em vez da de conflito.
- O `pg` avisa sobre `sslmode`; para silenciar, usar `sslmode=verify-full` explícito na connection string.
- Hierarquia de salas (Rooftop completo x Rooftop 1/2) não existe: são salas independentes.
