# Mapa do Projeto — Liga UNI

Mapa do código real. Não duplica regras (`CLAUDE.md`) nem estado (`docs/AI-STATE.md`). Mantenha em sincronia: criou
pasta de topo em `src/`, rota nova ou mudou o que uma rota faz, atualize aqui na mesma sessão.

## 1. Em uma frase

Ferramenta interna do Ágora UNI para gerir entidades acadêmicas de Joinville: entidades e líderes, membros (com
curso), calendário (eventos + reservas) e reserva de salas com aprovação do Ágora.

## 2. Stack e pontos de entrada

Next 16 (App Router, Turbopack) · React 19 · TS strict · Tailwind 3 · Prisma 7 + adapter-pg + Neon · Auth.js v5 ·
Zod 4 · date-fns · lucide-react · vitest.

| Arquivo | Papel |
|---|---|
| `src/proxy.ts` | Redirecionamento grosso por perfil (UX). **Não é a segurança**: matcher só cobre `/login`, `/admin/*`, `/lider/*` |
| `src/lib/auth.ts` / `auth.config.ts` | Auth.js: Credentials + JWT (sem adapter). `auth.config.ts` é seguro para o proxy (sem Prisma) |
| `src/lib/session.ts` | `getActor`, `requireAdmin`, `requireLeader`: reconsultam o banco a cada request |
| `src/lib/db.ts` | Singleton Prisma (`server-only`), pool `pg` com `DATABASE_URL` |
| `prisma.config.ts` | CLI do Prisma lê `DIRECT_URL` (fallback `DATABASE_URL`); seed = `tsx prisma/seed.ts` |

## 3. Rotas (`src/app/`)

| Rota | Perfil | O que faz |
|---|---|---|
| `/` | todos | Redireciona por perfil (ou `/login`) |
| `/login` | público | Login por e-mail/senha (`login/actions.ts`: `loginAction`, `logoutAction`) |
| `/admin/dashboard` | ADMIN | Cartões (entidades, membros, reservas aguardando, salas ativas), listas e resumo por entidade |
| `/admin/entidades` | ADMIN | CRUD de entidade + líder (cria `User` LEADER junto), ativar/desativar |
| `/admin/membros` | ADMIN | Leitura de todos os membros; filtros: nome/curso, entidade, situação; paginado |
| `/admin/calendario` | ADMIN | Calendário geral; filtros: entidade, tipo, status da reserva; edita/exclui qualquer evento |
| `/admin/reservas` | ADMIN | Fila de solicitações; filtros: status (padrão Aguardando), entidade, sala, período; aprovar/recusar com motivo |
| `/admin/salas` | ADMIN | CRUD de sala; "remover" = desativar |
| `/lider/dashboard` | LEADER | Cartões e listas da própria entidade |
| `/lider/equipe` | LEADER | Dados da entidade, descrição editável |
| `/lider/equipe/membros` | LEADER | CRUD de membros da própria entidade (remover = desativar; aba Removidos) |
| `/lider/calendario` | LEADER | Calendário geral; cria evento; edita/exclui só os da própria entidade; solicita sala |
| `/lider/reservas` | LEADER | Solicita sala, acompanha status/motivo da recusa, cancela |
| `/api/auth/[...nextauth]` | — | Handlers do Auth.js |

`admin/layout.tsx` e `lider/layout.tsx` chamam `requireAdmin()`/`requireLeader()`; `loading.tsx` em cada área.
Filtros e paginação vivem na URL (`searchParams`, GET); páginas são dinâmicas (`ƒ`).

## 4. Camadas

```
page.tsx (lê/monta)  →  componentes (props)         src/components/**
form submit          →  src/actions/*.ts            "use server": ator + Zod + serviço + refreshApp()
                        src/server/*.ts             regras de domínio + queries (recebem Actor, aplicam escopo)
                        src/lib/**                  infra: db, auth, sessão, datas, validações, erros, logger
```

- `src/actions/`: `members`, `events`, `reservations`, `entities`, `rooms`. Cada ação começa com `requireX()`.
- `src/server/`: `members`, `events`, `reservations` (conflito), `entities`, `rooms`, `calendar` (query do calendário
  por perfil), `calendarView` (parse de `searchParams` + grade), `dashboard`, `pagination`.
- `src/lib/validations/`: um arquivo por domínio (Zod). `common.ts` tem os campos reutilizáveis e `resolveRange`.
- `src/lib/action.ts`: `parseForm` (FormData → Zod) e `runAction` (erro esperado → mensagem, inesperado → log + genérico).
- `src/lib/datetime.ts`: fuso fixo America/Sao_Paulo (-03:00); `parseLocalDateTime` valida ida e volta.
- `src/lib/calendar.ts`: grade do mês com date-fns (chaves `yyyy-MM-dd`).

## 5. Componentes (`src/components/`)

- `ui/`: Button (+`buttonClass`), Dialog (`<dialog>` nativo), Toast, DataTable (tabela no desktop, lista no celular),
  Panel, PageHeader, StatusBadge/ReservationStatus, EmptyState, LoadingState/Skeleton, Pagination, FilterTabs, FilterForm,
  AppIcon (ícones por nome), ButtonContent.
- `form/`: ActionForm (`useActionState` + toast + fecha o Dialog), Fields (TextField/SelectField/TextAreaField, erro por
  campo com `aria-describedby`), DateTimeFields (DatePicker/TimeField), ConfirmDialog, QuickAction.
- `layout/`: AppShell (sidebar no desktop, barra inferior no celular), NavLinks, Logo.
- `calendar/`: CalendarView (compõe), CalendarGrid, CalendarAgenda, CalendarToolbar, CalendarFilters, CalendarLegend, itemStyle.
- `dashboard/`, `members/`, `events/`, `reservations/`, `entities/`, `rooms/`: diálogos e tabelas de cada domínio.
- Config: `src/config/site.ts` (nome/rótulos), `src/config/navigation.ts` (menus).

## 6. Autenticação e autorização

1. **Proxy** (`src/proxy.ts`): sem sessão → `/login`; perfil errado → própria home. Só conveniência.
2. **Layout** da área: `requireAdmin()`/`requireLeader()`.
3. **Cada Server Action**: `requireX()` antes de qualquer lógica (Server Actions são POSTs na própria rota; o proxy
   não é garantia).
4. **Serviço**: o líder nunca passa `entityId` do cliente; `actor.entityId` entra no `where` (`updateMany`/`deleteMany`
   com `{ id, entityId }` → 0 linhas = "não encontrado").
5. `getActor()` consulta o banco (usuário e entidade ativos), então desativar vale na hora mesmo com JWT válido.

## 7. Modelo de dados (`prisma/schema.prisma`)

`Entity` 1—1 `User` (líder; `User.entityId @unique`), `Entity` 1—N `Member`/`CalendarEvent`/`Reservation`,
`Room` 1—N `Reservation`, `Reservation` → `User` solicitante e `User` revisor. IDs `cuid(2)`. Enums `Role`,
`ReservationStatus`.

Migrations:
- `20261002220000_init`: tabelas, enums, índices.
- `20261002220100_reservation_no_overlap`: **SQL customizado**. `btree_gist` + `EXCLUDE USING gist ("roomId" WITH =,
  tsrange("startAt","endAt",'[)') WITH &&) WHERE status IN ('PENDING','APPROVED')` + `CHECK endAt > startAt`.
  Motivo: fechar a corrida "consultar → criar" no banco. Não é modelável no Prisma, então `migrate dev` não a mostra
  no schema: não remova ao regenerar migrations.

## 8. Reservas — regra de conflito

`nova.startAt < existente.endAt E nova.endAt > existente.startAt`, mesma sala, só PENDING/APPROVED bloqueiam.
Duas camadas: `findConflict` (mensagem amigável) e a constraint (garantia). `isOverlapViolation` traduz o erro do
Postgres (23P01) na mesma mensagem. Aprovar/recusar só age em PENDING (`updateMany` com `status: 'PENDING'`).

## 9. Seed (`prisma/seed.ts`)

Admin, 2 entidades demo + líder cada, membros, 11 salas (UNI e HUB, só dados), 3 eventos e 6 reservas em vários status.
Idempotente. Credenciais vêm de `ADMIN_*`/`LEADER1_*`/`LEADER2_*` (sem senha no código).

## 10. Coisas que chamam atenção numa leitura fria

- `Rooftop completo` e `Rooftop 1/2` (idem Metodologia) são salas **independentes** no modelo: reservar a "completa"
  não bloqueia as partes. Hierarquia de salas ficou fora do MVP.
- Datas: sempre via `datetime.ts`; `new Date('2026-02-31T…')` no V8 não falha (vira 03-03).
- `Date.now()` não pode ficar em componente (regra de pureza do React): calcule no serviço (ver `isPast`).
- Sem rate limiting no login (fora do MVP). Ver `docs/AI-STATE.md`.
