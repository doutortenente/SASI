import type { SofaTier } from '../types.js';

/** Classificação semântica do SOFA (espelha frontend drugs.ts). */
export function sofaTier(sofa: number | null | undefined): SofaTier {
  if (sofa == null || Number.isNaN(sofa)) return 'unknown';
  if (sofa >= 11) return 'critical';
  if (sofa >= 7) return 'high';
  if (sofa >= 4) return 'medium';
  return 'low';
}

/** Classes Tailwind usadas no frontend SASI. */
export function sofaColorClass(sofa: number | null | undefined): string {
  switch (sofaTier(sofa)) {
    case 'critical': return 'sofa-critical';
    case 'high': return 'sofa-high';
    case 'medium': return 'sofa-medium';
    case 'low': return 'sofa-low';
    default: return 'text-app-text-muted';
  }
}