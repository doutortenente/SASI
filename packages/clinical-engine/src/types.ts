export type SofaTier = 'low' | 'medium' | 'high' | 'critical' | 'unknown';

export interface SofaDisplayInput {
  sofa: number | null | undefined;
}