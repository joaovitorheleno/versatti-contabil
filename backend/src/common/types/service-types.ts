import { UserRole } from 'src/enum/user-role.enum';

export type ValidateCpfResponse = {
  id: string;
  info: {
    name: string;
    cpf: string;
    email: string;
    phone: string | undefined;
    role: UserRole;
  };
};
