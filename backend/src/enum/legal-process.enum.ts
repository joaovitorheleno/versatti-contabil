export enum LegalProcessTypeEnum {
  ABERTURA = 'ABERTURA',
  ALTERACAO = 'ALTERACAO',
  BAIXA = 'BAIXA',
  OUTRO = 'OUTRO',
}

export enum LegalProcessStatusEnum {
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  AGUARDANDO_CLIENTE = 'AGUARDANDO_CLIENTE',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
}

export const DEFAULT_PROCESS_STEPS: Record<LegalProcessTypeEnum, string[]> = {
  [LegalProcessTypeEnum.ABERTURA]: [
    'Consulta de viabilidade na prefeitura',
    'Registro na Junta Comercial',
    'Inscrição no CNPJ (Receita Federal)',
    'Inscrição Estadual',
    'Inscrição Municipal',
    'Alvará de funcionamento',
    'Enquadramento tributário',
    'Certificado digital da empresa',
  ],
  [LegalProcessTypeEnum.ALTERACAO]: [
    'Análise e minuta da alteração contratual',
    'Assinatura dos sócios',
    'Registro na Junta Comercial',
    'Atualização do CNPJ (Receita Federal)',
    'Atualização nos cadastros estadual e municipal',
  ],
  [LegalProcessTypeEnum.BAIXA]: [
    'Regularização de pendências fiscais',
    'Distrato social',
    'Registro do distrato na Junta Comercial',
    'Baixa do CNPJ (Receita Federal)',
    'Baixa nos cadastros estadual e municipal',
  ],
  [LegalProcessTypeEnum.OUTRO]: [],
};
