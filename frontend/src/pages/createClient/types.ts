import type { TaxRegimeEnum } from "../../common/enum/tax-regime.enum";

export type FormClientType = {
  id: string;
  name: string;
  cnpj: string;
  taxRegime: TaxRegimeEnum;
  tradeName: string;
  stateRegistration?: number | undefined;
  municipalRegistration?: number | undefined;
  nfeEmail?: string | undefined;
  phone: string;
  contactPerson?: string | undefined;
  zipCode: string;
  street: string;
  number: string;
  complement?: string | undefined;
  neighborhood: string;
  city: string;
  state: string;
  isActive: boolean;
};
