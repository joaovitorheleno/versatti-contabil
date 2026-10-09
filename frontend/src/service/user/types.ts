export type CreateUserType = {
  name: string;
  email: string;
  password?: string | undefined;
  cpf: string;
  phone: string;
  dateOfBirth?: string | undefined;
  clientIds: string[];
};

export type ListUserResponse = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  dateOfBirth: string;
}[];

export type InspectUserResponse = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  dateOfBirth?: string | undefined;
  clients: {
    id: string;
    name: string;
  }[];
};
