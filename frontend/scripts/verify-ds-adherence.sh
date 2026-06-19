#!/usr/bin/env bash
# Verificação de aderência ao DS pós-conversão de cores theme-aware.
# 1) nenhuma cor de status/sistema Tailwind sólida sobrou nos componentes
# 2) toda classe .tx-*/.stat-* usada existe em index.css
set -uo pipefail
cd "$(dirname "$0")/.."
SRC=src
CSS=src/index.css
fail=0

echo "== 1. Cores Tailwind sólidas remanescentes (text-*-{200..500} / bg-*-{900,950} sem opacidade) =="
LEFT=$(grep -rEn "text-(red|emerald|green|sky|blue|amber|orange|yellow|purple|violet|fuchsia|rose|lime|pink|teal|cyan|slate)-(200|300|400|500)\b" "$SRC/components" \
  | grep -vE "/[0-9]+" || true)
if [ -n "$LEFT" ]; then echo "$LEFT"; echo "  -> $(echo "$LEFT" | wc -l) ocorrências de TEXTO sólido restantes"; fail=1; else echo "  OK: nenhuma"; fi
echo
BGLEFT=$(grep -rEn "bg-(red|emerald|sky|amber|orange|rose|purple|teal|slate)-(900|950)\b" "$SRC/components" \
  | grep -vE "\-(900|950)/[0-9]+" || true)
if [ -n "$BGLEFT" ]; then echo "$BGLEFT"; echo "  -> bg sólido escuro restante"; fail=1; else echo "  OK: nenhum bg sólido escuro"; fi
echo
echo "== 2. Classes .tx-*/.stat-* usadas mas ausentes do index.css =="
USED=$(grep -rhoE "\b(tx|stat)-[a-z]+" "$SRC/components" | sort -u)
for c in $USED; do
  if ! grep -q "\.$c\b" "$CSS"; then echo "  FALTA no CSS: .$c"; fail=1; fi
done
[ "$fail" -eq 0 ] && echo "  OK: todas definidas"
echo
echo "== 3. Emoji em conteúdo clínico =="
EMO=$(grep -rnoP "[\x{1F000}-\x{1FAFF}\x{2600}-\x{27BF}\x{1F1E6}-\x{1F1FF}]" "$SRC/components" || true)
if [ -n "$EMO" ]; then echo "$EMO"; fail=1; else echo "  OK: nenhum emoji"; fi
echo
[ "$fail" -eq 0 ] && echo "RESULTADO: ✓ aderente" || echo "RESULTADO: ✗ pendências acima"
exit $fail
