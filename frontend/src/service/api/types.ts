export type CnpjResponse = {
  razao_social: string;
  nome_fantasia?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  ddd_telefone_1?: string;
  email?: string;
};

export type CnpjLookupResult =
  | { status: "found"; data: CnpjResponse }
  | { status: "not_found" }
  | { status: "unavailable" };

export type CepResponse = {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
};
