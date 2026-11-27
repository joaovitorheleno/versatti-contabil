import { UserRole } from 'src/enum/user-role.enum';

export type ValidateCpfResponse = {
  id: string;
  info: {
    name: string;
    cpf: string | null;
    email: string;
    phone: string | null | undefined;
    role: UserRole;
  };
};
