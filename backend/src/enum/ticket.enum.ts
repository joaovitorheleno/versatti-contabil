export enum TicketCategoryEnum {
  ADMISSAO = 'ADMISSAO',
  DEMISSAO = 'DEMISSAO',
  FERIAS = 'FERIAS',
  FOLHA = 'FOLHA',
  FISCAL = 'FISCAL',
  CONTABIL = 'CONTABIL',
  SOCIETARIO = 'SOCIETARIO',
  CERTIDOES = 'CERTIDOES',
  OUTROS = 'OUTROS',
}

export enum TicketPriorityEnum {
  BAIXA = 'BAIXA',
  NORMAL = 'NORMAL',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE',
}

export enum TicketStatusEnum {
  ABERTO = 'ABERTO',
  EM_ATENDIMENTO = 'EM_ATENDIMENTO',
  AGUARDANDO_CLIENTE = 'AGUARDANDO_CLIENTE',
  RESOLVIDO = 'RESOLVIDO',
  FECHADO = 'FECHADO',
}

export const TICKET_CATEGORY_LABELS: Record<TicketCategoryEnum, string> = {
  ADMISSAO: 'Admissão de funcionário',
  DEMISSAO: 'Demissão / rescisão',
  FERIAS: 'Férias',
  FOLHA: 'Folha de pagamento',
  FISCAL: 'Fiscal / impostos',
  CONTABIL: 'Contábil',
  SOCIETARIO: 'Societário',
  CERTIDOES: 'Certidões',
  OUTROS: 'Outros',
};

export const TICKET_STATUS_LABELS: Record<TicketStatusEnum, string> = {
  ABERTO: 'Aberto',
  EM_ATENDIMENTO: 'Em atendimento',
  AGUARDANDO_CLIENTE: 'Aguardando cliente',
  RESOLVIDO: 'Resolvido',
  FECHADO: 'Fechado',
};
