-- Correcao: evento_tipo_ref estava legivel so pelo papel `authenticated`, mas o app
-- roda hoje sem login (chave anon). Efeito: rotulo/unidade/faixa vinham vazios e as
-- telas de labs/sinais caiam em modo degradado (mostravam o codigo cru).
--
-- evento_tipo_ref e VOCABULARIO CLINICO, nao PHI: nome do exame, unidade padrao e
-- faixa de plausibilidade fisiologica. Nao ha nenhum dado de paciente aqui.
-- Por isso a leitura pode ser liberada para anon; a ESCRITA continua so service_role.
drop policy if exists evento_tipo_ref_read on public.evento_tipo_ref;
create policy evento_tipo_ref_read on public.evento_tipo_ref
  for select to anon, authenticated using (true);
