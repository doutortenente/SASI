// Escopo de leitos SASI (CLAUDE.md): padrao de referencia UTI#-L##.
export const UTIS = {
  UTI2: Array.from({length:12},(_,i)=>`L${String(i+1).padStart(2,"0")}`),
  UTI3: Array.from({length:13},(_,i)=>`L${String(i+1).padStart(2,"0")}`),
  UTI4: Array.from({length:8 },(_,i)=>`L${String(i+1).padStart(2,"0")}`),
} as const;
export type UtiId = keyof typeof UTIS;
export const TOTAL_LEITOS = 33;
