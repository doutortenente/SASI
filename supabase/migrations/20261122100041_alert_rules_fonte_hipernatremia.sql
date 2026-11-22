-- Regra de hipernatremia (Na > 150 mEq/L, warning) estava sem fonte gravada.
-- Limiar conferido no PubMed em 22-nov-2026; a regra em si nao muda.
update public.alert_rules
   set fonte = 'Darmon et al., Nephrol Dial Transplant 2010;25(8):2510-5 doi:10.1093/ndt/gfq067: hipernatremia adquirida na UTI, leve >145 e moderada a grave >150 mmol/L, ambas associadas de forma independente a mortalidade. Funk et al., Intensive Care Med 2010;36(2):304-11 doi:10.1007/s00134-009-1692-0: na admissao em UTI, limitrofe 145-150, leve 150-155, grave >155 mmol/L'
 where tipo_evento = 'na' and comparador = 'gt' and limiar = 150 and fonte is null;
