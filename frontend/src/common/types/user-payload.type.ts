export type UserPayload = {
  id: string;
  info: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
    role: string;
  };
  exp: number;
}