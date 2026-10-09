export type ClientsResponse = {
  id: string;
  name: string;
  cnpj: string;
  taxRegime: string;
  tradeName: string;
  stateRegistration?: number | undefined;
  municipalRegistration?: number | undefined;
  phone: string;
  nfeEmail?: string | undefined;
  contactPerson?: string | undefined;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  isActive: boolean;
};

export type EditClientType = {
  name: string;
  cnpj: string;
  taxRegime: string;
  tradeName: string;
  stateRegistration?: number | undefined;
  municipalRegistration?: number | undefined;
  phone: string;
  nfeEmail?: string | undefined;
  contactPerson?: string | undefined;
};
