import { jwtDecode } from "jwt-decode";

interface UserPayload {
  id: string;
  info: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
    dateOfBirth: string;
  };
  exp: number;
}

export const loggedUser = (): UserPayload | null => {
    const token = localStorage.getItem('@versatti:token')

    if(!token) return null;

    try {
        const decode = jwtDecode<UserPayload>(token);

        return decode;
    } catch (e) {
        console.error("Token inválido:", e);
        return null;
    }
    
}