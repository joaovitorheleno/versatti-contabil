import type { TaxRegimeEnum } from "../../common/enum/tax-regime.enum";

export type ClientsResponse = {
  id: string;
  name: string;
  cnpj: string;
  taxRegime: string;
  tradeName: string;
  stateRegistration?: number | undefined;
  municipalRegistration?: number | undefined;
};

export type CreateClientResponse = ClientsResponse & {
  nfeEmail?: string;
  phone: string;
  contactPerson?: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  isActive: boolean;
};
