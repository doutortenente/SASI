-- APLICADA no banco vivo em 22-nov-2026 (mesmo carimbo do banco). Não editar nem reaplicar.
-- O cabeçalho do paciente no design mostra o sexo, e a ficha usa esse dado na conta do
-- peso predito (volume corrente em mL/kg). O banco não tinha o campo.
alter table public.pacientes add column sexo text;
alter table public.pacientes add constraint pacientes_sexo_check check (sexo in ('masculino', 'feminino'));
comment on column public.pacientes.sexo is 'Sexo, como no cabeçalho do paciente do design: masculino | feminino. Entra na conta do peso predito (volume corrente em mL/kg). Vazio = a conta fica em branco.';
