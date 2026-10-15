export const DocumentCategoryEnum = {
  SOCIETARIO: 'SOCIETARIO',
  LICENCAS: 'LICENCAS',
  CERTIDOES: 'CERTIDOES',
  CERTIFICADO_DIGITAL: 'CERTIFICADO_DIGITAL',
  GUIAS: 'GUIAS',
  FISCAL: 'FISCAL',
  TRABALHISTA: 'TRABALHISTA',
  CONTABIL: 'CONTABIL',
  OUTROS: 'OUTROS',
} as const;

export type DocumentCategoryEnum =
  (typeof DocumentCategoryEnum)[keyof typeof DocumentCategoryEnum];

export const documentCategoryLabels: Record<DocumentCategoryEnum, string> = {
  [DocumentCategoryEnum.SOCIETARIO]: "Societário",
  [DocumentCategoryEnum.LICENCAS]: "Licenças e Alvarás",
  [DocumentCategoryEnum.CERTIDOES]: "Certidões",
  [DocumentCategoryEnum.CERTIFICADO_DIGITAL]: "Certificado Digital",
  [DocumentCategoryEnum.GUIAS]: "Guias de impostos",
  [DocumentCategoryEnum.FISCAL]: "Fiscal",
  [DocumentCategoryEnum.TRABALHISTA]: "Trabalhista",
  [DocumentCategoryEnum.CONTABIL]: "Contábil",
  [DocumentCategoryEnum.OUTROS]: "Outros",
};
