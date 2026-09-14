export type CreateUserType = {
    name: string;
    email: string;
    password?: string | undefined
    cpf: string;
    phone: string;
    dateOfBirth: string;
}

export type ListUserResponse = {
    name: string;
    email: string;
    cpf: string;
    phone: string;
    dateOfBirth: string;
}[]