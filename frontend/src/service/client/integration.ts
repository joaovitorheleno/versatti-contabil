import axios from "axios";
import { BASE_URL } from "../../config/url/baseUrl";
import type { ClientsResponse, EditClientType } from "./types";
import { getToken } from "../../config/token/getToken";

export const listClients = async (): Promise<ClientsResponse[]> => {
  const token = getToken();

  const response = await axios.get(`${BASE_URL}/client`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = response.data.map((client: any) => {
    return {
      id: client.id,
      name: client.name,
      cnpj: client.cnpj,
      taxRegime: client.taxRegime,
      tradeName: client.tradeName || "",
      stateRegistration: client.stateRegistration || "",
      municipalRegistration: client.municipalRegistration || "",
      nfeEmail: client.nfeEmail || undefined,
      phone: client.phone,
      contactPerson: client.contactPerson || "",
      zipCode: client.zipCode,
      street: client.street,
      number: client.number,
      complement: client.complement || "",
      neighborhood: client.neighborhood,
      city: client.city,
      state: client.state,
      isActive: client.isActive,
    };
  });

  return data;
};

export const createClient = async (newClient: ClientsResponse) => {
  const token = getToken();

  const response = await axios.post(`${BASE_URL}/client`, newClient, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const editClient = async (id: string, newClient: EditClientType) => {
  const token = getToken();

  const response = await axios.patch(`${BASE_URL}/client/${id}`, newClient, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const deleteClient = async (id: string) => {
  const token = getToken();

  const response = await axios.delete(`${BASE_URL}/client/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
