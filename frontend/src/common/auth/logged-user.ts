import { jwtDecode } from "jwt-decode";
import type { UserPayload } from "../types/user-payload.type";

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