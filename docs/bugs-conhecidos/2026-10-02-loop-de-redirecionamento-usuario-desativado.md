# Loop de redirecionamento para usuário desativado com sessão antiga

**Data:** 2026-10-02
**Severidade:** Média
**Onde:** `src/proxy.ts`, `src/lib/session.ts` (`requireActor`), `src/app/login/page.tsx`

**Causa raiz:** o JWT continua válido depois que o usuário (ou a entidade do líder) é desativado. O proxy mandava quem
tem JWT de `/login` para a home; o layout da home, que reconsulta o banco (`requireX`), mandava o usuário desativado
de volta para `/login`. Resultado: `ERR_TOO_MANY_REDIRECTS`.

**Como foi descoberto:** revisão de casos de borda depois dos testes de integração. Reproduzido logando como líder,
desativando a entidade no banco e abrindo `/lider/dashboard` com o cookie antigo (`curl -L` falha com erro 47).

**Correção:** `/login` saiu do matcher do proxy. A página de login chama `getActor()` (que consulta o banco) e só
redireciona para a home se o usuário continua válido; do contrário mostra o formulário.

**Prevenção:** decisão de "quem está logado" que tem redirecionamento nos dois sentidos precisa usar a mesma fonte de
verdade (o banco), nunca o JWT em um lado e o banco no outro.

**Fonte:** `docs/sessoes-claude/2026-10-02-mvp-liga-uni.md`
