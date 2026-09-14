import axios from "axios";
import { getToken } from "../../config/token/getToken";
import { BASE_URL } from "../../config/url/baseUrl";
import type { CreateUserType } from "./types";
import { openErrorNotification } from "../../components/notification/error";

export const createUser = async (user: CreateUserType): Promise<any> => {
    const token = getToken();

    if(!token) {
        openErrorNotification({
            title: "Erro ao acessar",
            description: "Token de Login expirado ou nao existe, faça o login."
        })

        return;
    }

    try{
        const response = await axios.post(`${BASE_URL}/user`, 
            user,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })

        return response.data;
    } catch (error: any){
        const message = error.response?.data?.message || 'Falha ao realizar o login.';
        throw new Error(message);
    }
    
}