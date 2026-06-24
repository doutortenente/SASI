// ============================================================================
// Ponto de entrada público do motor (referenciado por package.json "exports").
// Re-exporta a fachada de compatibilidade + os tipos.
//
// Se aparecer conflito de nome de export ao buildar (ex.: getSOFA exportado
// tanto por compat quanto por scores), restrinja este arquivo à fachada apenas.
// ============================================================================
export * from './clinical-logic-compat';
export type * from './types';
