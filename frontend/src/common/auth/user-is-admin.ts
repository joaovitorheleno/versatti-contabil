import { jwtDecode } from "jwt-decode";
import type { UserPayload } from "../types/user-payload.type";

export const isAdmin = () => {
    const token = localStorage.getItem('@versatti:token')

    if(!token) return null;

    try {
        const decode = jwtDecode<UserPayload>(token);
        const admin = decode?.info?.role === 'admin'

        return admin;
    } catch (e) {
        console.error("Token inválido:", e);
        return null;
    }

}