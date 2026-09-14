import axios from "axios";
import { getToken } from "../../config/token/getToken";
import { BASE_URL } from "../../config/url/baseUrl";
import type { CreateUserType, ListUserResponse } from "./types";

export const createUser = async (user: CreateUserType): Promise<any> => {
    const token = getToken();

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

export const listUsers = async (): Promise<ListUserResponse> => {
    const token = getToken();
    try {
        const response = await axios.get(`${BASE_URL}/user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

        return response.data;
    } catch (e) {
        throw new Error("Falha ao listar usuários.");
    }

    
}