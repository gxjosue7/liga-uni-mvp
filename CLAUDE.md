# CLAUDE.md — Liga UNI

Lido automaticamente pelo Claude Code. Regras de código, mobile-first e organização de docs herdadas do projeto
Nascimento Barbearia (o dono pediu o mesmo padrão), adaptadas ao Liga UNI. O que o briefing do produto exclui
(Sentry, Turnstile, Resend, Sanity, Mercado Pago, Redis, OAuth, storage externo) **não** entra aqui.

---

## Ao iniciar qualquer sessão

1. Leia este arquivo.
2. Leia `docs/AI-STATE.md`: estado atual, pendências e riscos conhecidos.
3. Para estrutura/arquitetura real do código (onde cada coisa fica, camadas de auth, mapa de rotas), consulte
   `docs/PROJECT_MAP.md` antes de explorar o repositório do zero. Ao criar pasta de topo em `src/`, rota nova, ou
   mudar o que uma rota mapeada faz, atualize o mapa **na mesma sessão**.
4. Ao final da sessão: registre em `docs/sessoes-claude/` (ver `.INSTRUCOES.md` lá) e atualize `docs/AI-STATE.md`.
5. Antes de investigar comportamento estranho, confira `docs/bugs-conhecidos/`. Ao achar/corrigir bug real, registre lá.

---

## Visão geral

**Liga UNI**: ferramenta interna do Ágora Tech Park (Ágora UNI, Joinville/SC) para gerir a relação contínua com
entidades acadêmicas: entidades, membros, calendário e reservas de salas. **Não confundir com o programa Liga Ágora.**

Dois perfis: `ADMIN` (equipe do Ágora) e `LEADER` (líder de uma entidade). Deploy: Vercel + Neon.
**Mobile-first absoluto**: UI pensada do zero para toque e tela pequena (375px), nunca adaptação de desktop.

## Stack

Next.js 16 (App Router; o middleware é `src/proxy.ts`, não `middleware.ts`) · React 19 · TypeScript strict ·
Tailwind 3 com design tokens · Prisma 7 + `@prisma/adapter-pg` + PostgreSQL (Neon) · Auth.js v5 (credentials, JWT,
sem adapter) · bcryptjs · Zod 4 · date-fns · lucide-react. Sem componente de UI de terceiros: componentes próprios.
Nada de Docker, Redis, websocket ou serviço externo.

Next 16 mudou APIs: `params`/`searchParams`/`cookies()` são assíncronos; consulte
`node_modules/next/dist/docs/` antes de usar uma API que você não tem certeza.

## Design

Identidade do Ágora: **amarelo-sinal, preto e branco**, fundo claro, geometria angular (raio 2–4px), Archivo
(variável, eixo de largura). Tokens em `src/app/globals.css` (variáveis) espelhados em `tailwind.config.ts`.
Cores com significado: amarelo = aguardando, verde = aprovada, vermelho = recusada/erro, azul = evento.
Não usar caixa-alta decorativa, fonte mono, setas `→` em botões, sombras genéricas, grade de cards idênticos.

---

## Regras de código

### Arquivos
- **Máximo 200 linhas** (ideal < 150). Passou: quebrar em módulos antes de continuar.
- Um arquivo = uma responsabilidade. Sem "utils genéricos" que viram depósito.

### TypeScript
- `strict: true`, zero `any`. Zero `as` / `!` sem comentário explicando por que é seguro.
- `interface` para objetos de dados, `type` para unions. Props: `NomeComponenteProps` no mesmo arquivo.
- Tipos compartilhados em `src/types/`. `unknown` + type guard quando o tipo não é conhecido.
- Camadas: `src/actions/` (Server Actions finas: autenticam, validam com Zod, chamam o serviço, revalidam) →
  `src/server/` (regras de domínio e queries; recebem o `Actor` explícito e aplicam o escopo) → `src/lib/` (infra).

### Componentes
- Server Component por padrão; `'use client'` só com interação (estado, diálogo, formulário com `useActionState`).
- Componente recebe dados via props: **nunca** busca dados. Páginas (`page.tsx`) leem do banco e passam adiante.
- Máximo 5 props diretas; sem prop drilling além de 2 níveis. `className?: string` em quem renderiza elemento raiz.
- `export function Nome()` (nunca `export const Nome = () =>`). Sem `index.ts` barrel: import direto pelo caminho.
- Ordem interna: hooks → derivações → handlers → render. Sem lógica de negócio no render.
- Nunca definir subcomponente com estado dentro de outro componente.
- Ícones de `lucide-react` não cruzam a fronteira servidor→cliente como função: passe o nome (string) e mapeie no cliente.

### Estado
- Estado próximo de onde é usado; preferir derivado a `useState`. Sem `useEffect` para sincronizar estado ou buscar dado.

### Nomenclatura
- Booleanos `is/has/should`; handlers `handle*`; componentes `PascalCase`; hooks `useCamelCase`; constantes `UPPER_SNAKE_CASE`.
- Modelos Prisma e enums seguem o briefing do produto (inglês: `Entity`, `Member`, `Room`, `CalendarEvent`,
  `Reservation`). Texto de interface, rotas (`/lider`, `/admin/entidades`) e mensagens: **PT-BR**.

### Imports
- Sempre `@/` (nunca `../../`). Ordem: React/Next → libs externas → `@/components` → `@/hooks` → `@/lib` →
  `@/config` → `import type`. Sem imports não usados.

### Tailwind / CSS
- Mobile-first: base = 375px, depois `md:`, `lg:`. Alvos de toque ≥ 44px (`min-h-11`).
- Sem `style={}` inline, sem `transition-all` (especifique a propriedade), `cn()` para classes condicionais.
- **Tokens obrigatórios, zero hex hardcoded em componente.**

### Zero hardcode
- Nome do produto, textos fixos de marca, navegação → `src/config/`. Cores → tokens. Fuso → `src/lib/datetime.ts`.
- Nenhuma credencial no código: seed lê variáveis de ambiente.

### Código morto — zero tolerância
- Sem `console.log` (usar `src/lib/logger.ts`), sem código comentado, sem função/variável/arquivo não usado,
  sem TODO sem descrição, sem otimização sem evidência de gargalo.

### Comentários
- Nenhum automático. Só o *porquê* de lógica não óbvia (ex.: constraint no banco, offset fixo do fuso).

### Markdown
- Nunca senha, token, chave, connection string ou dado pessoal real em `.md`. Citar o **nome** da variável, nunca o valor.

---

## Dados, validação e segurança

- **Toda entrada validada com Zod no servidor**, schemas em `src/lib/validations/` (um arquivo por domínio).
- **Autorização sempre no servidor.** Esconder botão não é segurança. Cada Server Action começa com
  `requireAdmin()` ou `requireLeader()` (`src/lib/session.ts`), que reconsulta o banco (usuário/entidade ativos).
- **Nunca confiar no cliente** para `entityId`, `role`, `userId`: derivados do ator autenticado. Líder só enxerga e
  altera dados da própria entidade: queries sempre com `where: { id, entityId: actor.entityId }`.
- Nunca retornar objeto Prisma cru: `select` explícito. Nunca `passwordHash` fora de `auth.ts`.
- Nunca vazar erro do banco: `runAction` (`src/lib/action.ts`) loga no servidor e devolve mensagem genérica.
- Login: mesma mensagem para e-mail inexistente e senha errada. Senha só com bcrypt.
- `import 'server-only'` em `src/lib/db.ts` e em tudo que toca banco/segredo. `NEXT_PUBLIC_*` nunca com segredo.
- Remoção de sala, membro e entidade = **desativar** (`active: false`). Nunca hard delete com histórico.
- Conflito de sala: checagem na aplicação **e** constraint `reservation_no_overlap` no banco (migration SQL).
  PENDING e APPROVED bloqueiam; REJECTED e CANCELLED não.
- Datas: guardar UTC; entrada/saída sempre por `src/lib/datetime.ts` (America/Sao_Paulo, offset fixo -03:00).
- Paginação (`PAGE_SIZE`) em listas, filtros no banco, calendário consulta só o intervalo visível, sem N+1.

## Tratamento de erros

- Nunca `try/catch` vazio. Erros esperados: `AppError` (mensagem amigável). Inesperados: `logger.error` + mensagem genérica.
- Server Components: `notFound()` / `redirect()` quando apropriado.

## Variáveis de ambiente

Nomes (sem valor) em `.env.example`: fonte de verdade. `.env.local` (gitignored) tem os valores. Nunca exibir o
conteúdo de `.env*` em conversa, log ou arquivo versionado.

---

## O que nunca fazer

- Confiar em `role`/`entityId`/`userId` vindos do cliente · `any` · `console.log` · hex hardcoded · `transition-all`
- Hard delete de sala/membro/entidade · retornar objeto Prisma completo · segredo em `NEXT_PUBLIC_*`
- Instalar biblioteca sem checar solução nativa antes · prop drilling · subcomponente com estado dentro de outro
- Subir Docker/Postgres local (a verificação é `localhost` no navegador contra o Neon)

## Git

- Nunca criar branch sem pedido explícito. Commits em português, no imperativo
  (`Adiciona fila de reservas do admin`). Nunca commitar `.env*`, `node_modules/`, `.next/`, `src/generated/`.
- **Sem rodapé `Co-Authored-By` nos commits**, como no Nascimento (a Vercel Hobby recusa colaborador extra em repo privado).
- Repositório ainda não foi publicado no GitHub: não criar remoto nem dar push sem pedido.

## Testes e verificação

- `npm run lint`, `npm run type-check`, `npm test` (regras puras: datas, validação, conflito), `npm run build`.
- Verificação de fluxo: `npm run dev` e conferir em `localhost` no navegador, contra o Neon. Sem Docker.

## Comandos

```bash
npm run dev              # localhost:3000
npm run build            # prisma generate + next build (não toca no banco)
npm run vercel-build     # prisma migrate deploy + next build (usado pela Vercel)
npm run lint && npm run type-check && npm test
npm run db:migrate       # aplica migrations (prisma migrate deploy)
npm run db:seed          # seed (lê ADMIN_*/LEADER*_* do ambiente)
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
