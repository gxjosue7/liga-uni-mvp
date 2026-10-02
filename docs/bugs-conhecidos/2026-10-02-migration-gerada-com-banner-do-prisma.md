# Migration inicial gerada com o banner de atualização do Prisma no final

**Data:** 2026-10-02
**Severidade:** Média
**Onde:** `prisma/migrations/20261002220000_init/migration.sql`

**Causa raiz:** o SQL foi gerado com `prisma migrate diff --script` redirecionando a saída para o arquivo. O Prisma
imprime o aviso "Update available" (uma caixa de texto) na mesma saída, e ele foi parar no final do `.sql`. O
Postgres falhou com `42601 syntax error` ao chegar nessa caixa (`P3018`).

**Como foi descoberto:** primeiro `prisma migrate deploy` no Neon.

**Correção:** remover as linhas do banner e rodar `prisma migrate resolve --rolled-back 20261002220000_init` antes de
reaplicar (a tentativa falha fica registrada em `_prisma_migrations` e bloqueia as seguintes). O script rodou como
uma transação implícita, então nada ficou criado pela metade.

**Prevenção:** ao gerar SQL com o CLI, conferir o fim do arquivo (`Get-Content ... | Select-Object -Last 5`) antes de
commitar, ou usar `prisma migrate dev --create-only` no lugar de redirecionar `migrate diff`.

**Fonte:** `docs/sessoes-claude/2026-10-02-mvp-liga-uni.md`
