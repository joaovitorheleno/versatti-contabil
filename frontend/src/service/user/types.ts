export type CreateUserType = {
    name: string;
    email: string;
    password?: string | undefined
    cpf: string;
    phone: string;
    dateOfBirth: string;
}