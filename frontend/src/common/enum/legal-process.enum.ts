export const LegalProcessTypeEnum = {
  ABERTURA: "ABERTURA",
  ALTERACAO: "ALTERACAO",
  BAIXA: "BAIXA",
  OUTRO: "OUTRO",
} as const;

export type LegalProcessTypeEnum =
  (typeof LegalProcessTypeEnum)[keyof typeof LegalProcessTypeEnum];

export const LegalProcessStatusEnum = {
  EM_ANDAMENTO: "EM_ANDAMENTO",
  AGUARDANDO_CLIENTE: "AGUARDANDO_CLIENTE",
  CONCLUIDO: "CONCLUIDO",
  CANCELADO: "CANCELADO",
} as const;

export type LegalProcessStatusEnum =
  (typeof LegalProcessStatusEnum)[keyof typeof LegalProcessStatusEnum];

export const legalProcessTypeLabels: Record<LegalProcessTypeEnum, string> = {
  ABERTURA: "Abertura de empresa",
  ALTERACAO: "Alteração contratual",
  BAIXA: "Baixa de empresa",
  OUTRO: "Outro",
};

export const legalProcessStatusConfig: Record<
  LegalProcessStatusEnum,
  { label: string; color: string }
> = {
  EM_ANDAMENTO: { label: "Em andamento", color: "blue" },
  AGUARDANDO_CLIENTE: { label: "Aguardando cliente", color: "orange" },
  CONCLUIDO: { label: "Concluído", color: "green" },
  CANCELADO: { label: "Cancelado", color: "default" },
};
