# Data inexistente (31 de fevereiro) era aceita e virava outro dia

**Data:** 2026-10-02
**Severidade:** Média
**Onde:** `src/lib/datetime.ts` (`parseLocalDateTime`), usada por todos os schemas de data (eventos e reservas)

**Causa raiz:** `new Date('2026-02-31T10:00:00-03:00')` não retorna `Invalid Date` no V8: o dia estoura e vira
03/03. Só checar `isNaN(getTime())` deixava passar uma data que o usuário nunca digitou, e a reserva seria criada
em outro dia.

**Como foi descoberto:** teste unitário (`datetime.test.ts`) escrito antes de usar a função nos formulários.

**Correção:** validação de ida e volta. Depois de parsear, o instante é convertido de volta para dia e hora locais
(`toDayKey`/`toTimeKey`) e precisa ser igual ao que entrou; se não for, retorna `null`.

**Fonte:** `docs/sessoes-claude/2026-10-02-mvp-liga-uni.md`
