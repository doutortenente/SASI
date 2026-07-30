# RUNBOOK — aplicar o modelo de dados v3 (F0)

> Em português de médico: "migration" = uma ordem de serviço datada que muda a planta do banco.
> **Regra de ouro:** rode primeiro numa *branch* do Supabase (um clone de teste), confira, depois no vivo.

## 1. As 3 migrations ATIVAS (seguras, aditivas — não mexem no dado)
Estão em `supabase/migrations/` e já foram validadas (aplicam limpo e em ordem, sem quebrar dado):

1. `20260730120000_enums_e_dimensao_eventos.sql` — cria os enums e a legenda `evento_tipo_ref` (56 tipos, com faixa e LOINC).
2. `20260730120100_eventos_tipo_fk.sql` — troca o CHECK de 56 valores pela FK à legenda (não-destrutivo).
3. `20260730120200_memorias_dono_e_severidade_insert.sql` — `memorias` ganha dono + semáforo no cadastro.

**Como aplicar (2 caminhos):**
- **Painel Supabase → SQL Editor:** cole o conteúdo de cada arquivo, na ordem, e rode.
- **CLI:** `supabase db push` (aplica as pendentes em ordem). Faça numa branch antes.

## 2. Os passos TRANCADOS (`supabase/migrations/_gated/`) — manuais
- `10_adocao_enums.sql` — adoção `text→enum`. Rode as verificações antes; **branch primeiro**.
- `20_rls_producao.sql` — segurança de produção. **Só depois do login real**, na ordem: login → carimbar donos → policies → remover `dev_bypass`.

## 3. Depois de aplicar
- Rode os **advisors** (Supabase → Advisors): o alerta do `dev_bypass` some após o passo `_gated/20`.
- **Regenere os tipos:** `supabase gen types typescript --project-id idswehsvvqczzkiatuzu > supabase/types/database.types.ts`.

## 4. Reverter (se precisar)
As 3 ativas são aditivas. Para desfazer:
- FK: `alter table eventos_clinicos drop constraint eventos_tipo_fk;` (e recriar o CHECK antigo, se quiser).
- `memorias`: `alter table memorias drop column user_id;` + `drop policy` das 4.
- Semáforo: `drop trigger trg_severidade_on_insert on pacientes;`.
- `evento_tipo_ref`: `drop table evento_tipo_ref cascade;` (some a FK junto).
