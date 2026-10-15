export const TicketCategoryEnum = {
  ADMISSAO: "ADMISSAO",
  DEMISSAO: "DEMISSAO",
  FERIAS: "FERIAS",
  FOLHA: "FOLHA",
  FISCAL: "FISCAL",
  CONTABIL: "CONTABIL",
  SOCIETARIO: "SOCIETARIO",
  CERTIDOES: "CERTIDOES",
  OUTROS: "OUTROS",
} as const;

export type TicketCategoryEnum =
  (typeof TicketCategoryEnum)[keyof typeof TicketCategoryEnum];

export const TicketPriorityEnum = {
  BAIXA: "BAIXA",
  NORMAL: "NORMAL",
  ALTA: "ALTA",
  URGENTE: "URGENTE",
} as const;

export type TicketPriorityEnum =
  (typeof TicketPriorityEnum)[keyof typeof TicketPriorityEnum];

export const TicketStatusEnum = {
  ABERTO: "ABERTO",
  EM_ATENDIMENTO: "EM_ATENDIMENTO",
  AGUARDANDO_CLIENTE: "AGUARDANDO_CLIENTE",
  RESOLVIDO: "RESOLVIDO",
  FECHADO: "FECHADO",
} as const;

export type TicketStatusEnum =
  (typeof TicketStatusEnum)[keyof typeof TicketStatusEnum];

export const ticketCategoryLabels: Record<TicketCategoryEnum, string> = {
  ADMISSAO: "Admissão de funcionário",
  DEMISSAO: "Demissão / rescisão",
  FERIAS: "Férias",
  FOLHA: "Folha de pagamento",
  FISCAL: "Fiscal / impostos",
  CONTABIL: "Contábil",
  SOCIETARIO: "Societário",
  CERTIDOES: "Certidões",
  OUTROS: "Outros",
};

export const ticketPriorityConfig: Record<TicketPriorityEnum, { label: string; color: string }> = {
  BAIXA: { label: "Baixa", color: "default" },
  NORMAL: { label: "Normal", color: "blue" },
  ALTA: { label: "Alta", color: "orange" },
  URGENTE: { label: "Urgente", color: "red" },
};

export const ticketStatusConfig: Record<TicketStatusEnum, { label: string; color: string }> = {
  ABERTO: { label: "Aberto", color: "blue" },
  EM_ATENDIMENTO: { label: "Em atendimento", color: "geekblue" },
  AGUARDANDO_CLIENTE: { label: "Aguardando cliente", color: "orange" },
  RESOLVIDO: { label: "Resolvido", color: "green" },
  FECHADO: { label: "Fechado", color: "default" },
};
