import axios from "axios";
import { getToken } from "../../config/token/getToken";
import { BASE_URL } from "../../config/url/baseUrl";
import type { AuthResponse, LoginType, SendPasswordResetParams } from "./types";
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

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

export const sendPasswordResetEmail = async ({
  toEmail,
  toName,
  resetLink,
}: SendPasswordResetParams) => {
  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: toEmail,
        to_name: toName,
        reset_link: resetLink,
      },
      EMAILJS_PUBLIC_KEY
    );
    return response;
  } catch (error) {
    console.error(error);
    throw new Error('Não foi possível enviar o e-mail de recuperação via EmailJS.');
  }
};

export const recoverPassword = async (email: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login/recover-password`, { email });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Não foi possível enviar o e-mail de recuperação.';
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }
};

export const changePassword = async (token: string, newPassword: string) => {
  try {
    const response = await axios.patch(`${BASE_URL}/auth/login/reset-password`, {
      token,
      newPassword,
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Não foi possível alterar a senha.';
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }
};