# scores-v2-staging — NAO integrado (fase futura)
Motor clinico v2 (SOFA Singer 2016 + Sepsis-3 + engine de alertas). **NAO compila como esta**:
depende de ~9 modulos ausentes (types, dictionaries/DVA_DICT, calculations/{parseBR,infusao,diurese,ratios},
guards/unitCoercion, constants, scores/qsofa) e usa o shape ANTIGO da ficha (pam1/cr1/pao2), nao o canonico.

**Enquanto isso, o SOFA do app vem do banco**: view `vw_sofa_diario` (ja viva, roda sobre eventos_clinicos).

Integracao (fase DELTA): recriar as dependencias, reconciliar o tipo Patient com o modelo canonico
(database.types), escrever testes Vitest por componente, e SO ENTAO promover para src/. Ver README.md.
