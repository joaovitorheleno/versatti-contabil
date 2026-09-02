import axios from "axios";
import { getToken } from "../../config/token/getToken";
import { BASE_URL } from "../../config/url/baseUrl";
import type { AuthResponse, LoginType } from "./types";

export const loginUser = async (credentials: LoginType): Promise<AuthResponse> => {
    try {
        const response = await axios.post<AuthResponse>(
            `${BASE_URL}/auth/login/user`,
            credentials,
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
        );

        const data = response.data;

        if (data.access_token) {
            localStorage.setItem('@versatti:token', data.access_token);
        }

        return data;
    } catch (error: any) {
        const message = error.response?.data?.message || 'Falha ao realizar o login.';
        throw new Error(Array.isArray(message) ? message.join(', ') : message);
    }
};

export const getPerfil = async () => {
  try {
    const token = getToken();

    const response = await axios.get(`${BASE_URL}/auth/perfil`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Não foi possível carregar o perfil do usuário.';
    throw new Error(message);
  }
};

export const validateCpf = async (cpf: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login/validate-cpf`, { cpf });
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.message || 'CPF inválido.';
        throw new Error(message);
    }
};

export const createPassword = async (cpf: string, password: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login/create-password`, { password, cpf });
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.message || 'CPF inválido.';
        throw new Error(message);
    }
};