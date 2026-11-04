export type LoginType = {
  cpf: string;
  password: string;
};

export type AuthResponse = {
  access_token: string;
  user?: {
    id: string;
    cpf: string;
    name: string;
  };
}
