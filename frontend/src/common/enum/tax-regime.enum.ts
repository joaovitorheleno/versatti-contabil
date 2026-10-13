export const TaxRegimeEnum = {
  SIMPLES_NACIONAL: 'Simples Nacional',
  LUCRO_PRESUMIDO: 'Lucro Presumido',
  LUCRO_REAL: 'Lucro Real',
  MEI: 'MEI',
} as const;

export type TaxRegimeEnum = (typeof TaxRegimeEnum)[keyof typeof TaxRegimeEnum];