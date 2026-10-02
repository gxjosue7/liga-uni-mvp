-- Proteção contra conflito de sala no nível do banco.
--
-- Por que SQL customizado: o Prisma não modela EXCLUDE constraints. A checagem
-- "consultar disponibilidade -> criar" feita na aplicação (src/server/reservations.ts)
-- tem janela de corrida: duas requisições simultâneas podem passar pela consulta
-- e inserir o mesmo horário. Esta constraint fecha a janela: o Postgres recusa a
-- segunda inserção (SQLSTATE 23P01) e a aplicação traduz isso na mesma mensagem
-- amigável de conflito.
--
-- Regra: na mesma sala, intervalos [startAt, endAt) não podem se sobrepor entre
-- reservas PENDING/APPROVED. REJECTED e CANCELLED não bloqueiam. Intervalo
-- semiaberto: uma reserva que termina às 10:00 não conflita com outra que
-- começa às 10:00 (mesma regra "nova.start < existente.end E nova.end > existente.start").
--
-- btree_gist permite combinar igualdade (roomId =) com sobreposição (&&) no mesmo
-- índice GiST.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Reservation"
  ADD CONSTRAINT "reservation_valid_range" CHECK ("endAt" > "startAt");

ALTER TABLE "Reservation"
  ADD CONSTRAINT "reservation_no_overlap"
  EXCLUDE USING gist (
    "roomId" WITH =,
    tsrange("startAt", "endAt", '[)') WITH &&
  )
  WHERE ("status" IN ('PENDING', 'APPROVED'));

ALTER TABLE "CalendarEvent"
  ADD CONSTRAINT "calendar_event_valid_range" CHECK ("endAt" > "startAt");
