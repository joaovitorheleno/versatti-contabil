import axios from "axios";
import { getToken } from "../../config/token/getToken";
import { BASE_URL } from "../../config/url/baseUrl";
import type {
  CreateUserType,
  InspectUserResponse,
  ListUserResponse,
} from "./types";

export const createUser = async (
  user: CreateUserType,
): Promise<CreateUserType> => {
  const token = getToken();
  try {
    const response = await axios.post(`${BASE_URL}/user`, user, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Falha ao realizar o login.";
    throw new Error(message);
  }
};

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
};

export const inspectUser = async (id: string): Promise<InspectUserResponse> => {
  const token = getToken();
  try {
    const response = await axios.get(`${BASE_URL}/user/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userData = {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email,
      cpf: response.data.cpf,
      phone: response.data.phone,
      clients: response.data.clients.map((client: any) => ({
        id: client.id,
        name: client.name,
      })),
    };

    return userData;
  } catch (e) {
    throw new Error("Falha ao inspecionar usuário.");
  }
};

export const editUser = async (
  id: string,
  userData: Partial<CreateUserType>,
) => {
  const token = getToken();
  try {
    const response = await axios.patch(`${BASE_URL}/user/${id}`, userData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Falha ao editar usuário.";
    throw new Error(message);
  }
};

export const deleteUser = async (id: string) => {
  const token = getToken();
  try {
    const response = await axios.delete(`${BASE_URL}/user/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Falha ao deletar usuário.";
    throw new Error(message);
  }
};
