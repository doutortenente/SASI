-- Apaga todos os pacientes antigos que restavam (os 14 com alta, de junho a setembro de 2026), por ordem do operador em 22-nov-2026.
-- DESTRUTIVO: junto saem as internacoes, evolucoes, exames, pendencias e alertas deles, e os 17 registros antigos de auditoria de ingest (copias dos dados enviados).
-- Paciente cadastrado a partir de 22-nov-2026 nao e tocado.
delete from public.pacientes where created_at < timestamptz '2026-11-22T00:00:00-03:00';
delete from public.ingest_audit_log where created_at < timestamptz '2026-11-22T00:00:00-03:00';
