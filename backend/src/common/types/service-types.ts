export type ValidateCpfResponse = {
    id: string,
    info: {
        name: string;
        cpf: string;
        email: string;
        phone: string;
        dateOfBirth: string;
    }
}

