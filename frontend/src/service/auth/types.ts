export type LoginType = {
  cpf: string;
  password: string;
};

export interface AuthResponse {
  access_token: string;
  user?: {
    id: string;
    cpf: string;
    name: string;
  };
}